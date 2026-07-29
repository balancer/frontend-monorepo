/**
 * Per-chain protocol metrics for the landing page — one upstream request,
 * server-cached.
 *
 * GET /api/protocol-stats-by-chain
 *
 * Backs `useChainProtocolStats` (TvlByChainBars + ProtocolHighlights).
 *
 * api-v3 has no cross-chain protocol query — `protocolMetricsChain` takes a
 * single chain — so the client used to fan out one Apollo query per supported
 * network, straight from the browser. That was ~12 direct api-v3 POSTs on
 * every cold landing-page visit, uncached, per visitor: the single largest
 * burst in the app and a standing rate-limit risk.
 *
 * Two things fix that here. First, routing through the server means the Next
 * Data Cache absorbs repeat visits (the same rationale as `/api/token-prices`
 * and `/api/snapshots`). Second, GraphQL aliases let all N chains ride in ONE
 * upstream document, so even a cold miss costs a single api-v3 request rather
 * than twelve — the same trick `/api/biggest-swaps` uses for `poolEvents`.
 *
 * Net: 12 uncached browser POSTs → 1 cached GET → 1 upstream request.
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { UpstreamError, gqlFetch, upstreamErrorToResponse } from '@analytics/lib/upstream/gql'

export const runtime = 'nodejs'

const API_URL = process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

/** These are rolling 24h aggregates — they move on the order of minutes at
 *  most, and the landing page is the app's most-visited surface. 5 minutes
 *  collapses a burst of visitors onto one upstream request. */
const STATS_REVALIDATE_SECONDS = 300

const CHAINS = PROJECT_CONFIG.supportedNetworks as readonly GqlChain[]

/** Mirrors the `GetProtocolStatsPerChain` selection set in
 *  `packages/lib/shared/services/api/protocol-stats.graphql`. `__typename` is
 *  selected explicitly so the payload satisfies the generated
 *  `GetProtocolStatsPerChainQuery['protocolMetricsChain']` type the client
 *  hook still exposes. */
const FIELDS = `
    __typename
    chainId
    numLiquidityProviders
    poolCount
    swapFee24h
    swapVolume24h
    totalLiquidity
    yieldCapture24h
    surplus24h`

/** One aliased root field per chain — `c0: protocolMetricsChain(chain: MAINNET)`
 *  — so N chains cost one upstream document instead of N requests. Chain
 *  values are GraphQL enum literals (unquoted) and come from
 *  `PROJECT_CONFIG.supportedNetworks`, never from user input. */
function buildQuery(chains: readonly GqlChain[]): string {
  const body = chains
    .map((chain, i) => `  c${i}: protocolMetricsChain(chain: ${chain}) {${FIELDS}\n  }`)
    .join('\n')
  return `query AnalyticsProtocolStatsByChain {\n${body}\n}`
}

type ChainMetrics = {
  __typename: 'GqlProtocolMetricsChain'
  chainId: string
  numLiquidityProviders: string
  poolCount: string
  swapFee24h: string
  swapVolume24h: string
  totalLiquidity: string
  yieldCapture24h: string
  surplus24h: string
}

type UpstreamRes = Record<string, ChainMetrics | null>

export type ProtocolStatsByChainResponse = {
  /** Per-chain metrics, descending by TVL. Chains the upstream had no data
   *  for are omitted rather than returned as nulls. */
  stats: Array<ChainMetrics & { chain: GqlChain }>
}

export async function GET(): Promise<Response> {
  try {
    const data = await gqlFetch<UpstreamRes>(
      API_URL,
      buildQuery(CHAINS),
      {},
      {
        upstream: 'api-v3',
        label: 'protocolMetricsChain (aliased fan-out)',
        cache: { revalidate: STATS_REVALIDATE_SECONDS },
      }
    )

    // Aliases map back positionally — `c{i}` ⇄ `CHAINS[i]`. A chain the
    // upstream can't answer for comes back null and is dropped, matching the
    // client's previous `.filter(Boolean)` behavior.
    const stats = CHAINS.map((chain, i) => {
      const metrics = data?.[`c${i}`]
      return metrics ? { ...metrics, chain } : null
    })
      .filter((s): s is ChainMetrics & { chain: GqlChain } => s !== null)
      .sort((a, b) => Number(b.totalLiquidity) - Number(a.totalLiquidity))

    const payload: ProtocolStatsByChainResponse = { stats }
    return Response.json(payload, {
      headers: {
        'Cache-Control': `s-maxage=${STATS_REVALIDATE_SECONDS}, stale-while-revalidate=1800`,
      },
    })
  } catch (err) {
    if (err instanceof UpstreamError) {
      const { status, body, headers } = upstreamErrorToResponse(err)
      return Response.json(body, { status, headers })
    }
    console.error('[protocol-stats-by-chain] failed', { chains: CHAINS.length })
    return Response.json(
      { error: 'protocol stats fetch failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
