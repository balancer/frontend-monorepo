/**
 * Per-pool cost basis + net deposited token amounts for an address, derived
 * by replaying every ADD/REMOVE liquidity event from api-v3.
 *
 * We fan out per chain × event type in parallel (2 × N queries for N
 * supported chains). api-v3 caps `first` at 1000 per query, but the cap is
 * applied to the *result set*, not the user's total history — so a single
 * cross-chain query for an active LP can clip everyone equally. Splitting
 * by chain gives each one its own 1000-event budget, which covers all but
 * the most extreme single-chain LPs.
 *
 * Each event carries a snapshot `valueUSD` per token at event timestamp,
 * which is exactly what we need for cost basis. The HODL comparison and
 * P&L math happen on the client where we also have the live position values
 * from the same `GetPools` query the rest of the portfolio uses.
 *
 * Truncation is tracked per chain × type: if any single chain still hits
 * the cap, only pools on *that* chain risk missing older history. The
 * cutoff timestamps are returned to the client so the hook can decide
 * per-pool whether the data is trustworthy.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import { isAddress } from 'viem'
import { NextResponse } from 'next/server'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export const runtime = 'nodejs'
export const revalidate = 600

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

// api-v3 caps `first` at 1000 per call. We paginate with `skip` up to a
// hard ceiling — most chains finish in one page, and the ceiling prevents
// a pathological LP from ballooning the request fan-out indefinitely.
const FETCH_LIMIT = 1000
const MAX_PAGES_PER_CHAIN = 5

const EVENTS_QUERY = /* GraphQL */ `
  query PortfolioEvents(
    $first: Int!
    $skip: Int!
    $chain: GqlChain!
    $user: String!
    $type: GqlPoolEventType!
  ) {
    poolEvents(
      first: $first
      skip: $skip
      where: { chainIn: [$chain], userAddress: $user, type: $type }
    ) {
      id
      poolId
      timestamp
      valueUSD
      chain
      ... on GqlPoolAddRemoveEventV3 {
        tokens {
          address
          amount
          valueUSD
        }
      }
    }
  }
`

type RawAddRemoveEvent = {
  id: string
  poolId: string
  timestamp: number
  valueUSD: number
  chain: GqlChain
  tokens?: { address: string; amount: string; valueUSD: number }[] | null
}

export type PortfolioPnlPoolEntry = {
  poolId: string
  chain: GqlChain
  /** Net deposited USD across all add/remove events (cost basis). May be
   *  negative for positions where the user has withdrawn more value than
   *  they deposited (typically because of fees / IL on prior cycles). */
  costBasisUsd: number
  /** Net deposited amount per token, indexed by lowercased address. */
  netTokens: Record<string, { amount: number; valueUsdAtDeposit: number }>
  /** Timestamp (unix seconds) of the earliest add event we observed. */
  firstEventAt: number | null
  addCount: number
  removeCount: number
}

export type PortfolioPnlPayload = {
  /** Lower-cased address the data is for. */
  address: string
  /** Per-pool entries keyed by `${chain}:${poolId}`. */
  entries: Record<string, PortfolioPnlPoolEntry>
  /** True if *any* chain × event-type fan-out hit the page cap. Affected
   *  chains are listed in `cutoffsByChain`. */
  truncated: boolean
  /** Per-chain × event-type cutoff timestamps. A `null` cutoff means the
   *  chain's response was complete for that event type. A number is the
   *  oldest event timestamp returned for that chain × type, which is the
   *  boundary the client uses to detect potentially-truncated pools. */
  cutoffsByChain: Record<string, { add: number | null; remove: number | null }>
  generatedAt: number
}

async function fetchEventsPage(
  address: string,
  chain: GqlChain,
  type: 'ADD' | 'REMOVE',
  skip: number
): Promise<RawAddRemoveEvent[]> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: EVENTS_QUERY,
      variables: {
        first: FETCH_LIMIT,
        skip,
        chain,
        user: address,
        type,
      },
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 ${chain}/${type} HTTP ${res.status}`)
  const json = (await res.json()) as {
    data?: { poolEvents: RawAddRemoveEvent[] }
    errors?: unknown
  }
  if (json.errors) throw new Error(`api-v3 ${chain}/${type} errors: ${JSON.stringify(json.errors)}`)
  return json.data?.poolEvents ?? []
}

/**
 * Sequentially page through one chain × type until either we drain the
 * event stream (response < cap) or we hit the per-chain page ceiling.
 * Returns `{ events, complete }` so the caller can flag pools when we
 * stopped paginating with more data still available.
 */
async function fetchAllEvents(
  address: string,
  chain: GqlChain,
  type: 'ADD' | 'REMOVE'
): Promise<{ events: RawAddRemoveEvent[]; complete: boolean }> {
  const all: RawAddRemoveEvent[] = []
  for (let page = 0; page < MAX_PAGES_PER_CHAIN; page++) {
    const events = await fetchEventsPage(address, chain, type, page * FETCH_LIMIT)
    all.push(...events)
    if (events.length < FETCH_LIMIT) return { events: all, complete: true }
  }
  return { events: all, complete: false }
}

function applyEvent(
  entries: Record<string, PortfolioPnlPoolEntry>,
  event: RawAddRemoveEvent,
  sign: 1 | -1
): void {
  const key = `${event.chain}:${event.poolId.toLowerCase()}`
  const existing = entries[key] ?? {
    poolId: event.poolId.toLowerCase(),
    chain: event.chain,
    costBasisUsd: 0,
    netTokens: {},
    firstEventAt: null,
    addCount: 0,
    removeCount: 0,
  }

  existing.costBasisUsd += sign * Number(event.valueUSD ?? 0)
  if (sign === 1) {
    existing.addCount += 1
    if (existing.firstEventAt == null || event.timestamp < existing.firstEventAt) {
      existing.firstEventAt = event.timestamp
    }
  } else {
    existing.removeCount += 1
  }

  for (const t of event.tokens ?? []) {
    const tokenKey = t.address.toLowerCase()
    const bucket = existing.netTokens[tokenKey] ?? { amount: 0, valueUsdAtDeposit: 0 }
    bucket.amount += sign * Number(t.amount ?? 0)
    bucket.valueUsdAtDeposit += sign * Number(t.valueUSD ?? 0)
    existing.netTokens[tokenKey] = bucket
  }

  entries[key] = existing
}

async function buildPayload(address: string): Promise<PortfolioPnlPayload> {
  const chains = PROJECT_CONFIG.supportedNetworks

  // Per chain × event type fan-out. Each task internally paginates with
  // `skip` until drained or until MAX_PAGES_PER_CHAIN, so a heavy LP on
  // one chain doesn't taint everyone else's coverage and most chains
  // finish in a single roundtrip.
  const tasks = chains.flatMap(chain =>
    (['ADD', 'REMOVE'] as const).map(type =>
      fetchAllEvents(address, chain, type).then(result => ({ chain, type, ...result }))
    )
  )
  const settled = await Promise.allSettled(tasks)

  const entries: Record<string, PortfolioPnlPoolEntry> = {}
  const cutoffsByChain: Record<string, { add: number | null; remove: number | null }> = {}
  for (const chain of chains) {
    cutoffsByChain[chain] = { add: null, remove: null }
  }
  let truncated = false

  for (const result of settled) {
    // Tolerate per-chain failures (api-v3 transient errors, chain not yet
    // indexed) rather than failing the whole route. The affected chain's
    // positions just won't have P&L data.
    if (result.status === 'rejected') continue
    const { chain, type, events, complete } = result.value
    const sign = type === 'ADD' ? 1 : -1
    for (const e of events) applyEvent(entries, e, sign)
    // Cutoff only applies when we ran out of page budget *and* still got
    // a full last page — that's the case where older events almost
    // certainly exist beyond what we fetched.
    if (!complete && events.length > 0) {
      cutoffsByChain[chain][type === 'ADD' ? 'add' : 'remove'] =
        events[events.length - 1].timestamp
      truncated = true
    }
  }

  return {
    address,
    entries,
    truncated,
    cutoffsByChain,
    generatedAt: Math.floor(Date.now() / 1000),
  }
}

// Per-address cache key — different addresses don't share results, and the
// 10-min revalidate window naturally throttles refresh. The version segment
// (`v2`) must be bumped whenever the payload shape changes so old cached
// blobs don't poison clients expecting the new schema.
const CACHE_VERSION = 'v2'
function makeCachedFetcher(address: string) {
  return unstable_cache(
    () => buildPayload(address),
    ['portfolio-pnl', CACHE_VERSION, address],
    {
      revalidate: 600,
      tags: [`portfolio-pnl:${address}`],
    }
  )
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> }
): Promise<NextResponse<PortfolioPnlPayload | { error: string }>> {
  const { address: rawAddress } = await ctx.params
  if (!isAddress(rawAddress)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }
  const address = rawAddress.toLowerCase()
  try {
    const payload = await makeCachedFetcher(address)()
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
