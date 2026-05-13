/**
 * Top SWAP events by USD value over the last 24h, cached server-side.
 *
 * api-v3's `poolEvents` filter doesn't expose `valueUSD_gt` or a timestamp
 * bound, so we fetch a generous window of recent SWAPs (first: 300) sorted by
 * api-v3's default order (timestamp desc), filter to `t >= now - 86400`, sort
 * by valueUSD, and return the top 10. Aggressive `revalidate = 300` means
 * api-v3 sees at most one request per 5 min regardless of how many users hit
 * the dashboard.
 *
 * Token symbol enrichment is intentionally omitted — addresses are kept
 * short-form and the row links to the chain's block explorer for full detail.
 * Adding symbols would require either a heavy `tokenGetTokens(chains: …)`
 * call per chain or a separate per-address fetch, both of which we want to
 * avoid here.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import type { BiggestSwap, BiggestSwapsPayload } from '@analytics/lib/biggest-swaps/types'

export const runtime = 'nodejs'
export const revalidate = 300

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

const QUERY = /* GraphQL */ `
  query BiggestSwaps($first: Int!, $chains: [GqlChain!]!) {
    poolEvents(first: $first, where: { chainIn: $chains, type: SWAP }) {
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
    }
  }
`

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
const FETCH_LIMIT = 300

async function fetchSwaps(): Promise<RawEvent[]> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: QUERY,
      variables: { first: FETCH_LIMIT, chains: PROJECT_CONFIG.supportedNetworks },
    }),
    // Rely on Next.js' route-segment cache (`revalidate = 300`) rather than
    // fetch's own cache — the latter is keyed on URL+body and would silently
    // share state across deployments / preview branches.
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 HTTP ${res.status}`)
  const json = (await res.json()) as { data?: { poolEvents: RawEvent[] }; errors?: unknown }
  if (json.errors) throw new Error(`api-v3 errors: ${JSON.stringify(json.errors)}`)
  return json.data?.poolEvents ?? []
}

type TokenInfo = { chain: GqlChain; address: string; symbol: string | null; logoURI: string | null }

// Bulk-fetch token metadata for the chains that actually appear in the top
// swaps. Done once per route refresh (inside the cached function), so the
// upstream `tokenGetTokens` call is throttled by the same 5-min revalidate
// window as the swaps fetch.
async function fetchTokenMap(chains: GqlChain[]): Promise<Map<string, TokenInfo>> {
  if (chains.length === 0) return new Map()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: TOKENS_QUERY, variables: { chains } }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 tokens HTTP ${res.status}`)
  const json = (await res.json()) as {
    data?: { tokenGetTokens: TokenInfo[] }
    errors?: unknown
  }
  if (json.errors) throw new Error(`api-v3 tokens errors: ${JSON.stringify(json.errors)}`)
  const out = new Map<string, TokenInfo>()
  for (const t of json.data?.tokenGetTokens ?? []) {
    out.set(`${t.chain}:${t.address.toLowerCase()}`, t)
  }
  return out
}

async function buildPayload(): Promise<BiggestSwapsPayload> {
  const now = Math.floor(Date.now() / 1000)
  const cutoff = now - WINDOW_SECONDS
  const events = await fetchSwaps()
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

  // Enrich with symbol + logoURI from api-v3's token list. Token lookup is
  // best-effort: a failure here degrades to short-address rendering rather
  // than failing the whole route.
  const chains = Array.from(new Set(top.map(s => s.chain)))
  let tokens: Map<string, TokenInfo> = new Map()
  try {
    tokens = await fetchTokenMap(chains)
  } catch {
    // swallow — icons just won't render
  }
  const items: BiggestSwap[] = top.map(s => {
    const tin = tokens.get(`${s.chain}:${s.tokenInAddress.toLowerCase()}`)
    const tout = tokens.get(`${s.chain}:${s.tokenOutAddress.toLowerCase()}`)
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
  { revalidate: 300, tags: ['biggest-swaps'] }
)

export async function GET() {
  try {
    return Response.json(await getBiggestSwapsPayload())
  } catch (err) {
    const now = Math.floor(Date.now() / 1000)
    return Response.json(
      { items: [], generatedAt: now, windowSeconds: WINDOW_SECONDS, error: String(err) },
      { status: 502 }
    )
  }
}
