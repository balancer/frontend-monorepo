/**
 * Hourly protocol-snapshot writer.
 *
 * Hits api-v3 once for `protocolMetricsAggregated(chains: [...])`. That single
 * call returns the cross-chain aggregate plus a per-chain breakdown
 * (`chains: GqlProtocolMetricsChain[]`), so we get ~11 rows per tick without
 * fan-out. Each row is keyed on `(ts, chain)` where:
 *   - `ts` is the unix-seconds top-of-hour bucket (we floor `now()` to the
 *     hour so re-runs in the same window upsert the same row idempotently)
 *   - `chain = 'ALL'` for the aggregate row; otherwise the `GqlChain` enum
 *     name (e.g. `'MAINNET'`, `'ARBITRUM'`)
 *
 * Vercel cron injects `Authorization: Bearer ${CRON_SECRET}`; we verify it
 * before doing any work. The same route can be hit manually with that header
 * to force a write outside the cron cadence (useful for debugging on a fresh
 * deploy).
 *
 * What this does NOT do: backfill. api-v3 only exposes point-in-time metrics
 * (`swapVolume24h` etc are trailing-24h rolling values), so there is no
 * historical endpoint to walk. The series grows forward from first cron run.
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import networkConfigs from '@repo/lib/config/networks'
import { isChainDeprecated } from '@repo/lib/modules/chains/chain.utils'
import { ensureSchema, sql, AGGREGATE_KEY, type SnapshotRow } from '@analytics/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'
const HOUR_S = 60 * 60

// chainId → GqlChain enum name. Sourced from the canonical network configs
// so new chains added to @repo/lib are picked up automatically.
const CHAIN_BY_ID = new Map<number, GqlChain>()
for (const [chain, cfg] of Object.entries(networkConfigs)) {
  if (cfg) CHAIN_BY_ID.set(cfg.chainId, chain as GqlChain)
}

// Pass every non-deprecated chain to the aggregator. The api silently drops
// chains with no v3 activity, so this is safe to keep maximal — when a new
// chain comes online we don't need to redeploy.
const ACTIVE_CHAINS: GqlChain[] = Object.values(GqlChain).filter(
  c => !isChainDeprecated(c)
)

const QUERY = /* GraphQL */ `
  query ProtocolSnapshot($chains: [GqlChain!]!) {
    protocolMetricsAggregated(chains: $chains) {
      totalLiquidity
      swapVolume24h
      swapFee24h
      yieldCapture24h
      surplus24h
      poolCount
      numLiquidityProviders
      chains {
        chainId
        totalLiquidity
        swapVolume24h
        swapFee24h
        yieldCapture24h
        surplus24h
        poolCount
        numLiquidityProviders
      }
    }
  }
`

type RawMetrics = {
  totalLiquidity: string
  swapVolume24h: string
  swapFee24h: string
  yieldCapture24h: string
  surplus24h: string
  poolCount: string
  numLiquidityProviders: string
}
type RawChainMetrics = RawMetrics & { chainId: string }
type RawAggregated = RawMetrics & { chains: RawChainMetrics[] }

async function fetchMetrics(): Promise<RawAggregated> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { chains: ACTIVE_CHAINS } }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 HTTP ${res.status}`)
  const json = (await res.json()) as {
    data?: { protocolMetricsAggregated: RawAggregated }
    errors?: unknown
  }
  if (json.errors) throw new Error(`api-v3 errors: ${JSON.stringify(json.errors)}`)
  if (!json.data) throw new Error('api-v3 returned no data')
  return json.data.protocolMetricsAggregated
}

function toRow(m: RawMetrics, ts: number, chain: string): SnapshotRow {
  return {
    ts,
    chain,
    totalLiquidity: Number.parseFloat(m.totalLiquidity) || 0,
    swapVolume24h: Number.parseFloat(m.swapVolume24h) || 0,
    swapFee24h: Number.parseFloat(m.swapFee24h) || 0,
    yieldCapture24h: Number.parseFloat(m.yieldCapture24h) || 0,
    surplus24h: Number.parseFloat(m.surplus24h) || 0,
    poolCount: Number.parseInt(m.poolCount, 10) || 0,
    numLps: Number.parseInt(m.numLiquidityProviders, 10) || 0,
  }
}

async function upsertRows(rows: SnapshotRow[]): Promise<void> {
  if (rows.length === 0) return
  // `sql.transaction([...])` batches N parameterised statements into one HTTP
  // round-trip, so 11 rows ≠ 11 trips. Per-row INSERT keeps the parameter
  // map readable; building one big multi-VALUES statement would need
  // `sql.query(text, params)` which isn't exposed by the tagged-template
  // client typings.
  await sql.transaction(
    rows.map(
      r => sql`
        INSERT INTO protocol_snapshots (
          ts, chain, total_liquidity, swap_volume_24h, swap_fee_24h,
          yield_capture_24h, surplus_24h, pool_count, num_lps
        ) VALUES (
          ${r.ts}, ${r.chain}, ${r.totalLiquidity}, ${r.swapVolume24h},
          ${r.swapFee24h}, ${r.yieldCapture24h}, ${r.surplus24h},
          ${r.poolCount}, ${r.numLps}
        )
        ON CONFLICT (ts, chain) DO UPDATE SET
          total_liquidity   = EXCLUDED.total_liquidity,
          swap_volume_24h   = EXCLUDED.swap_volume_24h,
          swap_fee_24h      = EXCLUDED.swap_fee_24h,
          yield_capture_24h = EXCLUDED.yield_capture_24h,
          surplus_24h       = EXCLUDED.surplus_24h,
          pool_count        = EXCLUDED.pool_count,
          num_lps           = EXCLUDED.num_lps
      `
    )
  )
}

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  await ensureSchema()

  const ts = Math.floor(Date.now() / 1000 / HOUR_S) * HOUR_S
  const rows: SnapshotRow[] = []
  const skipped: string[] = []
  let error: string | undefined

  try {
    const data = await fetchMetrics()
    rows.push(toRow(data, ts, AGGREGATE_KEY))
    for (const c of data.chains) {
      const chainId = Number.parseInt(c.chainId, 10)
      const chain = Number.isFinite(chainId) ? CHAIN_BY_ID.get(chainId) : undefined
      if (!chain) {
        // Unknown chain id from api-v3 — don't silently fold it into the
        // aggregate by mislabelling. Logged in the response so we can spot
        // new chains we need to teach @repo/lib about.
        skipped.push(c.chainId)
        continue
      }
      rows.push(toRow(c, ts, chain))
    }
    await upsertRows(rows)
  } catch (e) {
    error = String(e)
  }

  return Response.json({
    ok: !error,
    ts,
    written: rows.length,
    skipped,
    error,
    ranAt: new Date().toISOString(),
  })
}
