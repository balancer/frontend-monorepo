/**
 * Top SWAP events by USD value over the last 24h, cached server-side.
 *
 * api-v3 used to honor `chainIn: [...]` on `poolEvents` and return events from
 * every chain in the array. As of late Feb 2026 it silently collapses to the
 * first chain only (effectively MAINNET-only), so a single `chainIn` query
 * leaves the dashboard blind to swaps on the other 12 networks. We work around
 * this by aliasing one `poolEvents(chainIn: [<single>])` subquery per chain in
 * a single GraphQL request — still one upstream HTTP roundtrip — and merging
 * client-side.
 *
 * api-v3 still has no `valueUSD_gt` or timestamp bound, so we pull a generous
 * window of recent SWAPs per chain (FETCH_PER_CHAIN), filter to
 * `t >= now - 86400`, sort by valueUSD, return top N. Hourly `revalidate`
 * means api-v3 sees at most one fan-out request per hour regardless of how
 * many users hit the dashboard.
 *
 * Token symbol enrichment piggy-backs on the same revalidate window via
 * `tokenGetTokens(chains: …)`.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  UpstreamError,
  gqlFetch,
  upstreamErrorToResponse,
} from '@analytics/lib/upstream/gql'
import type { BiggestSwap, BiggestSwapsPayload } from '@analytics/lib/biggest-swaps/types'

export const runtime = 'nodejs'
export const revalidate = 3600

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

const SWAP_FIELDS = /* GraphQL */ `
  id
  poolId
  timestamp
  tx
  valueUSD
  chain
  ... on GqlPoolSwapEventV3 {
    tokenIn {
      address
      amount
    }
    tokenOut {
      address
      amount
    }
  }
  ... on GqlPoolSwapEventCowAmm {
    tokenIn {
      address
      amount
    }
    tokenOut {
      address
      amount
    }
  }
`

// Build one aliased `poolEvents(chainIn: [<chain>])` subfield per supported
// chain. Aliases (`c0`, `c1`, …) sidestep GraphQL's "fields with same name
// must have identical args" rule and keep the response addressable by index.
function buildAliasedQuery(chains: GqlChain[]): string {
  const subqueries = chains
    .map(
      (chain, i) => `
    c${i}: poolEvents(first: $first, where: { chainIn: [${chain}], type: SWAP }) {
      ${SWAP_FIELDS}
    }
  `
    )
    .join('\n')
  return /* GraphQL */ `
    query BiggestSwaps($first: Int!) {
      ${subqueries}
    }
  `
}

const TOKENS_QUERY = /* GraphQL */ `
  query SwapTokens($chains: [GqlChain!]!) {
    tokenGetTokens(chains: $chains) {
      chain
      address
      symbol
      logoURI
    }
  }
`

type RawEvent = {
  id: string
  poolId: string
  timestamp: number
  tx: string
  valueUSD: number
  chain: GqlChain
  __typename?: string
  tokenIn?: { address: string; amount: string } | null
  tokenOut?: { address: string; amount: string } | null
}

const WINDOW_SECONDS = 24 * 60 * 60
const TOP_N = 10
// Recent events per chain. 200 covers ~100 min on MAINNET (the busiest chain)
// and the full 24h window on the long tail. We sort upstream by timestamp desc
// and post-filter by USD anyway — the top of the USD distribution is sparse
// enough that this window catches the outliers we care about. At one upstream
// call per hour the per-refresh payload (~13 chains × 200 = ~1.3MB) is cheap.
const FETCH_PER_CHAIN = 200

async function fetchSwaps(): Promise<RawEvent[]> {
  const chains = PROJECT_CONFIG.supportedNetworks as GqlChain[]
  // Rely on Next.js' route-segment cache (`revalidate = 3600`) rather than
  // fetch's own cache — the latter is keyed on URL+body and would silently
  // share state across deployments / preview branches.
  const data = await gqlFetch<Record<string, RawEvent[]>>(
    API_URL,
    buildAliasedQuery(chains),
    { first: FETCH_PER_CHAIN },
    { upstream: 'api-v3', label: 'biggest-swaps', cache: 'no-store' }
  )
  if (!data) return []
  // Flatten the aliased response. Order doesn't matter — buildPayload sorts
  // by valueUSD before slicing.
  const out: RawEvent[] = []
  for (const events of Object.values(data)) {
    if (Array.isArray(events)) out.push(...events)
  }
  return out
}

type TokenInfo = { chain: GqlChain; address: string; symbol: string | null; logoURI: string | null }

// Bulk-fetch token metadata for the chains that actually appear in the top
// swaps. Done once per route refresh (inside the cached function), so the
// upstream `tokenGetTokens` call is throttled by the same revalidate
// window as the swaps fetch.
async function fetchTokenMap(chains: GqlChain[]): Promise<Map<string, TokenInfo>> {
  if (chains.length === 0) return new Map()
  const data = await gqlFetch<{ tokenGetTokens: TokenInfo[] }>(
    API_URL,
    TOKENS_QUERY,
    { chains },
    { upstream: 'api-v3', label: 'biggest-swaps-tokens', cache: 'no-store' }
  )
  const out = new Map<string, TokenInfo>()
  for (const t of data?.tokenGetTokens ?? []) {
    out.set(`${t.chain}:${t.address.toLowerCase()}`, t)
  }
  return out
}

async function buildPayload(): Promise<BiggestSwapsPayload> {
  const now = Math.floor(Date.now() / 1000)
  const cutoff = now - WINDOW_SECONDS

  // Fetch swaps and the full per-chain token list in parallel. Previously
  // these were sequential: we waited for swaps, computed the set of chains
  // appearing in the top-N, then fetched tokens for only those chains. The
  // narrower second query saved bandwidth but blocked behind the first
  // — ~200–400ms of avoidable latency per cache miss. Fetching for every
  // supported network up front is wasteful per-byte but the result is
  // identical from the user's perspective and the route is cached hourly,
  // so the extra token rows are paid for at most once per window.
  const [events, tokenMap] = await Promise.all([
    fetchSwaps(),
    // Best-effort: a token-list failure shouldn't sink the whole route.
    // Swallowing here matches the previous sequential code's behavior
    // (icons just won't render).
    fetchTokenMap(PROJECT_CONFIG.supportedNetworks as GqlChain[]).catch(
      () => new Map<string, TokenInfo>()
    ),
  ])

  const top: BiggestSwap[] = events
    .filter(e => e.timestamp >= cutoff && Number.isFinite(e.valueUSD))
    .sort((a, b) => b.valueUSD - a.valueUSD)
    .slice(0, TOP_N)
    .map(e => ({
      id: e.id,
      poolId: e.poolId,
      timestamp: e.timestamp,
      tx: e.tx,
      valueUSD: e.valueUSD,
      chain: e.chain,
      tokenInAddress: e.tokenIn?.address ?? '',
      tokenOutAddress: e.tokenOut?.address ?? '',
      tokenInAmount: e.tokenIn?.amount ?? '0',
      tokenOutAmount: e.tokenOut?.amount ?? '0',
    }))

  const items: BiggestSwap[] = top.map(s => {
    const tin = tokenMap.get(`${s.chain}:${s.tokenInAddress.toLowerCase()}`)
    const tout = tokenMap.get(`${s.chain}:${s.tokenOutAddress.toLowerCase()}`)
    return {
      ...s,
      tokenInSymbol: tin?.symbol ?? undefined,
      tokenOutSymbol: tout?.symbol ?? undefined,
      tokenInLogo: tin?.logoURI ?? undefined,
      tokenOutLogo: tout?.logoURI ?? undefined,
    }
  })

  return { items, generatedAt: now, windowSeconds: WINDOW_SECONDS }
}

// Fixed cache key — the route takes no params, so an attacker varying the
// query string can't shape a new cache entry. The api-v3 call runs at most
// once per `revalidate` window across all visitors.
const getBiggestSwapsPayload = unstable_cache(
  buildPayload,
  ['biggest-swaps'],
  { revalidate: 3600, tags: ['biggest-swaps'] }
)

export async function GET() {
  try {
    // Browser/CDN cache aligned with the server-side `revalidate: 3600` —
    // 1h freshness with a 2h SWR window so navigation back to the dashboard
    // is instant.
    return Response.json(await getBiggestSwapsPayload(), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    })
  } catch (err) {
    const now = Math.floor(Date.now() / 1000)
    // Rate-limit and other upstream failures get a structured response so
    // the client can render an honest "the API is throttled, wait and
    // retry" message instead of a generic "something broke". The payload
    // still includes the empty `items` array shape so legacy consumers
    // that don't read `error` keep working.
    if (err instanceof UpstreamError) {
      const mapped = upstreamErrorToResponse(err, {
        includeDevDetail: process.env.NODE_ENV !== 'production',
      })
      return Response.json(
        { items: [], generatedAt: now, windowSeconds: WINDOW_SECONDS, ...mapped.body },
        { status: mapped.status, headers: mapped.headers }
      )
    }
    return Response.json(
      { items: [], generatedAt: now, windowSeconds: WINDOW_SECONDS, error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
