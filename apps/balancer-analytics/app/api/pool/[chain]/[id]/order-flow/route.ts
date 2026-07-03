/**
 * Pool order-flow swap feed.
 *
 * GET /api/pool/[chain]/[id]/order-flow
 *
 *   Fetches the last 30 days of swap events for a pool from api-v3 (capped
 *   at HARD_CAP swaps), classifies each one's `sender` via the 4-tier
 *   label cascade (CowAmm typename → direct dict → deployer-family dict →
 *   unknown), and returns labeled swaps + the fetched window's totals +
 *   coverage stats.
 *
 *   Range filtering (24h / 7d / 30d) lives on the *client*: it filters
 *   `swaps[]` by `timestamp` in-memory and recomputes per-range stats.
 *   This mirrors frontend-v3's `PoolActivityChart` strategy — fetch once,
 *   filter many. The reason it has to be this way: re-paginating api-v3
 *   for every range click trips upstream rate limits within seconds (two
 *   toggles ≈ 50 paginated calls).
 *
 *   Lazy enrichment: on every fresh request (cache miss), the top-N
 *   unknown senders (by USD volume) get a synchronous Etherscan v2
 *   `getcontractcreation` lookup and the result is upserted into
 *   `swap_source_metadata`. Subsequent visits read from the cache without
 *   an Etherscan roundtrip.
 */

import 'server-only'
import { z } from 'zod'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
import {
  ensureSchemaOnce,
  getDuneLabels,
  getSwapTxMetadata,
  upsertSwapTxMetadata,
} from '@analytics/lib/db'
import { fetchTxToAddresses } from '@analytics/lib/drpc/tx-info'
import { labelSwapSource } from '@analytics/app/pool/[chain]/[id]/_components/PoolOrderFlow/labels'
import { DIRECT_LABELS } from '@analytics/app/pool/[chain]/[id]/_components/PoolOrderFlow/labels/direct'
import type {
  LabeledSwap,
  SourceLabel,
} from '@analytics/app/pool/[chain]/[id]/_components/PoolOrderFlow/types'
import type {
  OrderFlowResponse,
} from '@analytics/app/pool/[chain]/[id]/_components/PoolOrderFlow/api-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

/** api-v3 page size. PoolActivityChart on frontend-v3 uses 500 — confirmed
 *  safe under the upstream's per-request cap. Larger pages mean fewer
 *  roundtrips, which matters because each roundtrip is ~200ms of latency
 *  AND a step closer to api-v3's per-IP burst limit. */
const PAGE_SIZE = 500
/** Hard cap on swaps fetched per request. 10000 / 500 = ~20 api-v3
 *  roundtrips on the cold path. Tuned so that the 30d range on hot pools
 *  (e.g. GHO/USDT/USDC at ~625 swaps/day) covers a meaningful window —
 *  at 5000 the cap landed at ~8 days, making "7d" and "30d" views nearly
 *  identical. At 10000 the same pool spans ~16 days, giving the two
 *  ranges visibly different data. Hot pools may still cap below 30d;
 *  the subtitle surfaces that ("last 16d (cap reached)"). */
const HARD_CAP = 10000
/** Cap on synchronous tx.to lookups per request. dRPC handles these in
 *  parallel; at PER_REQUEST_CONCURRENCY=12 in `tx-info.ts`, 100 calls
 *  complete in ~2–4s. Each route hit progressively enriches the cache —
 *  the next visit's coverage benefits from this one's work. */
const ENRICH_LIMIT_PER_REQUEST = 100
/** Always fetch this much history. The client filters narrower windows
 *  (24h / 7d) in-memory; the route is hit at most once per pool per CDN
 *  cache window regardless of which range the user picks. */
const FETCH_WINDOW_DAYS = 30

const PoolIdSchema = z
  .string()
  .regex(
    /^0x[a-fA-F0-9]{40}([a-fA-F0-9]{24})?$/,
    'pool must be a 0x-prefixed address (42 chars) or V2 poolId (66 chars)'
  )

const ChainSchema = z
  .string()
  .min(1)
  .transform((slug, ctx) => {
    try {
      return getChainSlug(slug.toLowerCase() as ChainSlug)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unknown chain slug: ${slug}` })
      return z.NEVER
    }
  })
  .refine(chain => (PROJECT_CONFIG.supportedNetworks as readonly GqlChain[]).includes(chain), {
    message: 'chain not in PROJECT_CONFIG.supportedNetworks',
  })

// ── api-v3 query ───────────────────────────────────────────────────────────
// Inlined verbatim so this route stays self-contained — no Apollo dependency
// for server-side fetches. The fragment shape mirrors the codegen'd
// GetPoolEvents query (including the `sender` field added in Phase 1).
const SWAPS_QUERY = /* GraphQL */ `
  query OrderFlow($first: Int!, $skip: Int!, $poolId: String!, $chainIn: [GqlChain!]!) {
    poolEvents(
      first: $first
      skip: $skip
      where: { poolId: $poolId, chainIn: $chainIn, type: SWAP }
    ) {
      id
      timestamp
      tx
      valueUSD
      __typename
      ... on GqlPoolSwapEventV3 {
        sender
        tokenIn { address amount }
        tokenOut { address amount }
      }
      ... on GqlPoolSwapEventCowAmm {
        sender
        tokenIn { address amount valueUSD }
        tokenOut { address amount valueUSD }
      }
    }
  }
`

type RawSwap = {
  id: string
  timestamp: number
  tx: string
  valueUSD: number
  __typename: 'GqlPoolSwapEventV3' | 'GqlPoolSwapEventCowAmm' | string
  sender?: string | null
  tokenIn?: { address: string; amount: string } | null
  tokenOut?: { address: string; amount: string } | null
}

/** Upstream failure flavor — drives both the HTTP status the route returns
 *  and the user-facing error string the client UI renders. Rate limits get
 *  their own bucket because the right user action is "wait and retry", not
 *  "report a bug" — and that needs to be visible in the chart's empty state
 *  rather than buried in a generic 502 message. */
type UpstreamErrorKind = 'rate_limit' | 'upstream_5xx' | 'network' | 'graphql'

class UpstreamError extends Error {
  readonly kind: UpstreamErrorKind
  readonly status: number | null
  constructor(kind: UpstreamErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'UpstreamError'
    this.kind = kind
    this.status = status
  }
}

/** Per-IP rate-limit signal from api-v3 / its CDN. 429 is the canonical one;
 *  503 and 504 are commonly returned by upstream proxies during throttling
 *  bursts too. Treating all three as "rate limited" matches what the user
 *  actually experiences ("the API is refusing my requests, I should wait"). */
function isRateLimitStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 504
}

async function fetchSwaps(
  poolId: string,
  chain: GqlChain,
  cutoffTs: number
): Promise<{ swaps: RawSwap[]; capped: boolean; truncated: boolean }> {
  const swaps: RawSwap[] = []
  let skip = 0
  let capped = false
  // `truncated = true` means we returned a partial result because of an
  // upstream api-v3 failure mid-pagination. Surfaces in the response so
  // the client knows the totals aren't authoritative.
  let truncated = false

  while (swaps.length < HARD_CAP) {
    let res: Response
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SWAPS_QUERY,
          variables: { first: PAGE_SIZE, skip, poolId, chainIn: [chain] },
        }),
        cache: 'no-store',
      })
    } catch (err) {
      // Network error talking to api-v3. If this is the very first page,
      // we have nothing to render — surface the error so the route returns
      // 502. After at least one page, prefer a partial result to a hard
      // failure.
      if (swaps.length === 0) {
        throw new UpstreamError(
          'network',
          `api-v3 fetch failed: ${err instanceof Error ? err.message : String(err)}`
        )
      }
      console.warn('[order-flow] api-v3 mid-pagination network error — returning partial')
      truncated = true
      break
    }

    if (!res.ok) {
      if (swaps.length === 0) {
        const kind: UpstreamErrorKind = isRateLimitStatus(res.status)
          ? 'rate_limit'
          : 'upstream_5xx'
        throw new UpstreamError(
          kind,
          `api-v3 HTTP ${res.status} (skip=${skip})`,
          res.status
        )
      }
      console.warn(
        `[order-flow] api-v3 HTTP ${res.status} at skip=${skip} — returning partial`
      )
      truncated = true
      break
    }

    const json = (await res.json()) as { data?: { poolEvents?: RawSwap[] }; errors?: unknown }
    if (json.errors) {
      if (swaps.length === 0) {
        throw new UpstreamError('graphql', `api-v3 errors: ${JSON.stringify(json.errors)}`)
      }
      console.warn('[order-flow] api-v3 GraphQL errors mid-pagination — returning partial')
      truncated = true
      break
    }

    const page = json.data?.poolEvents ?? []
    if (page.length === 0) break

    let pageOldest = Infinity
    for (const ev of page) {
      pageOldest = Math.min(pageOldest, ev.timestamp)
      if (ev.timestamp >= cutoffTs) swaps.push(ev)
    }
    // The page is timestamp-desc — once its oldest entry crosses the cutoff
    // we've consumed everything in-range. Bail without re-fetching.
    if (pageOldest < cutoffTs) break
    skip += PAGE_SIZE
  }
  if (swaps.length >= HARD_CAP) capped = true
  return { swaps, capped, truncated }
}

/** Per-tx USD totals restricted to txs whose `sender` is NOT in the
 *  direct labels dict — i.e. the txs that would currently render as
 *  "Unknown" if we only consult `sender`. These are the only txs where
 *  tx.to enrichment can actually change the label, so they're the only
 *  ones worth spending RPC budget on. Already-labeled MEV operator txs
 *  (sender = jaredfromsubway etc.) get skipped even if their USD is high. */
function unlabeledUsdByTx(
  swaps: readonly RawSwap[],
  labeledSenders: Record<string, unknown>
): Map<string, number> {
  // First pass: mark any tx that has at least one labeled-sender swap as
  // "already covered" — enriching its tx.to wouldn't change the cascade.
  const alreadyLabeled = new Set<string>()
  for (const s of swaps) {
    if (!s.tx || !s.sender) continue
    if (labeledSenders[s.sender.toLowerCase()]) {
      alreadyLabeled.add(s.tx.toLowerCase())
    }
  }
  // Second pass: sum USD for the remaining txs.
  const m = new Map<string, number>()
  for (const s of swaps) {
    if (!s.tx) continue
    const tx = s.tx.toLowerCase()
    if (alreadyLabeled.has(tx)) continue
    m.set(tx, (m.get(tx) ?? 0) + (s.valueUSD || 0))
  }
  return m
}

type RouteContext = { params: Promise<{ chain: string; id: string }> }

export async function GET(_request: Request, ctx: RouteContext): Promise<Response> {
  const raw = await ctx.params

  const parsed = z
    .object({ chain: ChainSchema, id: PoolIdSchema })
    .safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { chain, id } = parsed.data
  const poolId = id.toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  const cutoff = now - FETCH_WINDOW_DAYS * 86400

  try {
    await ensureSchemaOnce()

    const { swaps, capped, truncated } = await fetchSwaps(poolId, chain, cutoff)
    if (truncated) {
      console.warn('[order-flow] partial result returned (api-v3 paging stopped early)', {
        chain,
        pool: poolId,
        partial: swaps.length,
      })
    }
    const totalUsd = swaps.reduce((a, s) => a + (s.valueUSD || 0), 0)

    // ── tx.to enrichment ────────────────────────────────────────────────
    // api-v3's `sender` field is the tx originator EOA, which is mostly
    // anonymous. The actual entry contract (aggregator, router, MEV bot
    // contract) lives in `tx.to`. We look it up via drpc, persist a
    // per-tx cache, and feed both signals into the cascade.
    const distinctTxHashes = Array.from(
      new Set(swaps.map(s => s.tx?.toLowerCase()).filter((x): x is string => Boolean(x)))
    )
    const txToCache = await getSwapTxMetadata(chain, distinctTxHashes)

    // Prioritize *unlabeled* txs by USD volume — txs whose sender is
    // already in the direct dict are classified correctly without any
    // tx.to lookup, so spending RPC budget on them is wasted. This is
    // empirical: on MEV-saturated pools the top-USD txs are ALL labeled
    // MEV operator infra, and naive top-USD enrichment left coverage
    // unchanged because the cascade had already decided.
    const labeledByDictSenders = DIRECT_LABELS[chain] ?? {}
    const unlabeledUsd = unlabeledUsdByTx(swaps, labeledByDictSenders)
    const txsToEnrich = [...unlabeledUsd.entries()]
      .filter(([tx]) => !txToCache.has(tx))
      .sort((a, b) => b[1] - a[1])
      .slice(0, ENRICH_LIMIT_PER_REQUEST)
      .map(([tx]) => tx)

    if (txsToEnrich.length > 0) {
      try {
        const fresh = await fetchTxToAddresses(chain, txsToEnrich)
        // Merge in-memory + persist. `fresh` is seeded with `null` for
        // every input hash so the cache reliably records "we tried" and
        // doesn't re-enrich the same tx on next visit.
        for (const [hash, toAddr] of fresh) txToCache.set(hash, toAddr)
        await upsertSwapTxMetadata(
          chain,
          [...fresh.entries()].map(([txHash, toAddress]) => ({ txHash, toAddress }))
        )
      } catch (err) {
        // Enrichment failures must never break the response. The cascade
        // falls back to sender-lookup which still catches Dune-listed MEV
        // searcher EOAs.
        console.warn(
          '[order-flow] tx.to enrichment failed:',
          err instanceof Error ? err.message : String(err)
        )
      }
    }

    // ── Dune label lookup ──────────────────────────────────────────────
    // Bulk-fetched weekly via `/api/cron/sync-dune-labels` from Dune query
    // 3004790. Looked up by both `sender` (EOA) AND `tx.to` (entry
    // contract); the cascade consults each in priority order.
    const lookupAddresses = new Set<string>()
    for (const s of swaps) {
      if (s.sender) lookupAddresses.add(s.sender.toLowerCase())
    }
    for (const toAddr of txToCache.values()) {
      if (toAddr) lookupAddresses.add(toAddr.toLowerCase())
    }
    const duneCache = await getDuneLabels(chain, [...lookupAddresses])

    // Cascade-label every swap with whatever we have now.
    const labeled: LabeledSwap[] = []
    for (const s of swaps) {
      if (!s.sender) continue // shouldn't happen on V3/CowAmm swaps but guard anyway
      const source: SourceLabel = labelSwapSource(
        { __typename: s.__typename, sender: s.sender, tx: s.tx },
        chain,
        { txTo: txToCache, dune: duneCache }
      )
      labeled.push({
        id: s.id,
        timestamp: s.timestamp,
        tx: s.tx,
        valueUSD: s.valueUSD || 0,
        sender: s.sender,
        tokenIn: s.tokenIn ?? { address: '', amount: '0' },
        tokenOut: s.tokenOut ?? { address: '', amount: '0' },
        source,
      })
    }

    // Coverage = "we put a real label on it" (anything not 'unknown').
    let labeledUsd = 0
    const unknownSenderSet = new Set<string>()
    for (const s of labeled) {
      if (s.source.category === 'unknown') unknownSenderSet.add(s.sender.toLowerCase())
      else labeledUsd += s.valueUSD
    }

    // `fetchedWindow.from` is the *intended* cutoff; the actual oldest swap
    // may be more recent if pagination capped (capped=true) or if the pool
    // simply has no older swaps. The client uses both to render an honest
    // "showing last N swaps from the last X days" subtitle.
    const oldestSwapTs = swaps.length > 0
      ? swaps.reduce((min, s) => Math.min(min, s.timestamp), Infinity)
      : now

    const payload: OrderFlowResponse = {
      pool: poolId,
      chain,
      fetchedWindow: { from: cutoff, to: now, oldestSwapTs, days: FETCH_WINDOW_DAYS },
      totals: { swapCount: labeled.length, volumeUsd: totalUsd, capped, truncated },
      coverage: {
        labeledUsd,
        labeledPct: totalUsd > 0 ? labeledUsd / totalUsd : 0,
        unknownSenders: unknownSenderSet.size,
      },
      swaps: labeled,
    }

    return Response.json(payload, {
      headers: {
        // 10 min shared cache, 30 min stale-while-revalidate. Long enough to
        // amortize the api-v3 fan-out + any enrichment latency; short enough
        // that fresh swaps surface within the same trading session.
        'Cache-Control': 's-maxage=600, stale-while-revalidate=1800',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const kind: UpstreamErrorKind | 'internal' =
      err instanceof UpstreamError ? err.kind : 'internal'
    console.error('[order-flow] failed', { chain, id: poolId, kind, message })

    // Map each upstream-failure flavor to (status, error code). The client
    // reads `error` to pick a friendly message; matching the upstream's HTTP
    // semantics where possible (429 for rate limit) also helps CDNs and any
    // future browser-side retry logic behave sensibly.
    const isRateLimit = kind === 'rate_limit'
    const status = isRateLimit ? 429 : 502
    const errorCode = isRateLimit
      ? 'rate_limited'
      : kind === 'network'
        ? 'upstream_unreachable'
        : kind === 'graphql'
          ? 'upstream_graphql_error'
          : kind === 'upstream_5xx'
            ? 'upstream_error'
            : 'internal_error'

    // In dev, include the actual upstream error in the response body so a
    // failure can be diagnosed without opening the dev server log. In prod
    // we keep the generic message — these errors can include URLs or other
    // diagnostic noise we don't want to leak.
    const body: Record<string, unknown> = { error: errorCode }
    if (isRateLimit) {
      // Reading the upstream's Retry-After would be ideal; api-v3 doesn't
      // expose it in dev tests but the structure is here for future use.
      body.message =
        'Balancer API rate limit reached. Please wait a minute and try again.'
    }
    if (process.env.NODE_ENV !== 'production') body.detail = message

    const headers: Record<string, string> = { 'Cache-Control': 'no-store' }
    // Retry-After hints both browsers and any caller doing exponential backoff
    // that this isn't a hard failure — wait and try again. 60s is generous;
    // most per-IP buckets refill in <30s.
    if (isRateLimit) headers['Retry-After'] = '60'

    return Response.json(body, { status, headers })
  }
}
