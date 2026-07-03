/**
 * Hourly protocol-snapshot writer.
 *
 * One GraphQL call to api-v3 returns two aliases:
 *   - `core` = `protocolMetricsAggregated(chains: [...])` — cross-chain
 *     aggregate plus per-chain breakdown. This is the "everything api-v3
 *     sees" headline; it already includes CoW AMM in its numbers.
 *   - `cowAmm` = all `poolGetPools(poolTypeIn: [COW_AMM])` with their chain
 *     + dynamicData. We sum these per chain locally to produce the COW_AMM
 *     breakdown rows. CoW AMM is a *subset of* CORE — never additive.
 *
 * Each tick produces 2 × (1 aggregate + N chains) rows keyed on
 * `(ts, chain, protocol)`. `ts` is unix-seconds top-of-hour, so re-running
 * inside the same window upserts the same rows idempotently.
 *
 * Vercel cron injects `Authorization: Bearer ${CRON_SECRET}`; we verify it
 * before doing any work.
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import networkConfigs from '@repo/lib/config/networks'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  ensureSchemaOnce,
  sql,
  AGGREGATE_KEY,
  PROTOCOL_CORE,
  PROTOCOL_COW_AMM,
  SOURCE_API,
  type SnapshotRow,
} from '@analytics/lib/db'

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

// Match the chain set used by the hero KPI (`useProtocolStats` →
// `PROJECT_CONFIG.supportedNetworks`). Using a broader set here produces a
// chart total that disagrees with the headline TVL — the gap surfaced as the
// Sonic-shaped $9M discrepancy. Source of truth for "what counts as the
// protocol" lives in supportedNetworks; this tracks it.
const ACTIVE_CHAINS: GqlChain[] = PROJECT_CONFIG.supportedNetworks

const QUERY = /* GraphQL */ `
  query ProtocolSnapshot($chains: [GqlChain!]!) {
    core: protocolMetricsAggregated(chains: $chains) {
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
    cowAmm: poolGetPools(
      where: { chainIn: $chains, poolTypeIn: [COW_AMM] }
      first: 1000
    ) {
      chain
      dynamicData {
        totalLiquidity
        volume24h
        fees24h
        yieldCapture24h
        surplus24h
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
type RawCowAmmPool = {
  chain: GqlChain
  dynamicData: {
    totalLiquidity: string | null
    volume24h: string | null
    fees24h: string | null
    yieldCapture24h: string | null
    surplus24h: string | null
  }
}
type RawResponse = { core: RawAggregated; cowAmm: RawCowAmmPool[] }

async function fetchMetrics(): Promise<RawResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { chains: ACTIVE_CHAINS } }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 HTTP ${res.status}`)
  const json = (await res.json()) as { data?: RawResponse; errors?: unknown }
  if (json.errors) throw new Error(`api-v3 errors: ${JSON.stringify(json.errors)}`)
  if (!json.data) throw new Error('api-v3 returned no data')
  return json.data
}

function coreRow(m: RawMetrics, ts: number, chain: string): SnapshotRow {
  return {
    ts,
    chain,
    protocol: PROTOCOL_CORE,
    totalLiquidity: Number.parseFloat(m.totalLiquidity) || 0,
    swapVolume24h: Number.parseFloat(m.swapVolume24h) || 0,
    swapFee24h: Number.parseFloat(m.swapFee24h) || 0,
    yieldCapture24h: Number.parseFloat(m.yieldCapture24h) || 0,
    surplus24h: Number.parseFloat(m.surplus24h) || 0,
    poolCount: Number.parseInt(m.poolCount, 10) || 0,
    numLps: Number.parseInt(m.numLiquidityProviders, 10) || 0,
    source: SOURCE_API,
  }
}

// CoW AMM has no aggregate endpoint — we fold the pool list locally. LP count
// isn't derivable per-pool, so num_lps stays 0 on CoW AMM rows. Chart should
// treat 0-valued fields on COW_AMM rows as "unknown", not "zero".
function aggregateCowAmm(pools: RawCowAmmPool[], ts: number): SnapshotRow[] {
  type Bucket = {
    totalLiquidity: number
    swapVolume24h: number
    swapFee24h: number
    yieldCapture24h: number
    surplus24h: number
    poolCount: number
  }
  const empty = (): Bucket => ({
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
  })
  const all = empty()
  const byChain = new Map<GqlChain, Bucket>()
  for (const p of pools) {
    const dd = p.dynamicData
    const v = {
      totalLiquidity: Number.parseFloat(dd.totalLiquidity ?? '0') || 0,
      swapVolume24h: Number.parseFloat(dd.volume24h ?? '0') || 0,
      swapFee24h: Number.parseFloat(dd.fees24h ?? '0') || 0,
      yieldCapture24h: Number.parseFloat(dd.yieldCapture24h ?? '0') || 0,
      surplus24h: Number.parseFloat(dd.surplus24h ?? '0') || 0,
    }
    all.totalLiquidity += v.totalLiquidity
    all.swapVolume24h += v.swapVolume24h
    all.swapFee24h += v.swapFee24h
    all.yieldCapture24h += v.yieldCapture24h
    all.surplus24h += v.surplus24h
    all.poolCount += 1
    const b = byChain.get(p.chain) ?? empty()
    b.totalLiquidity += v.totalLiquidity
    b.swapVolume24h += v.swapVolume24h
    b.swapFee24h += v.swapFee24h
    b.yieldCapture24h += v.yieldCapture24h
    b.surplus24h += v.surplus24h
    b.poolCount += 1
    byChain.set(p.chain, b)
  }
  const toRow = (b: Bucket, chain: string): SnapshotRow => ({
    ts,
    chain,
    protocol: PROTOCOL_COW_AMM,
    ...b,
    numLps: 0,
    source: SOURCE_API,
  })
  return [toRow(all, AGGREGATE_KEY), ...Array.from(byChain, ([c, b]) => toRow(b, c))]
}

async function upsertRows(rows: SnapshotRow[]): Promise<void> {
  if (rows.length === 0) return
  // Single HTTP roundtrip — `sql.transaction([...])` packs every statement
  // into one neon-serverless fetch. ~12 rows per tick (6 chains × 2 protocol
  // breakdowns + 2 aggregates) → 1 round trip, no lingering connection,
  // function returns and the DB is free to scale to zero. Structured log
  // mirrors `[db]` entries so the post-deploy verification trace shows one
  // write per cron tick and nothing else.
  const start = Date.now()
  await sql.transaction(
    rows.map(
      r => sql`
        INSERT INTO protocol_snapshots (
          ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
          yield_capture_24h, surplus_24h, pool_count, num_lps, source
        ) VALUES (
          ${r.ts}, ${r.chain}, ${r.protocol}, ${r.totalLiquidity}, ${r.swapVolume24h},
          ${r.swapFee24h}, ${r.yieldCapture24h}, ${r.surplus24h},
          ${r.poolCount}, ${r.numLps}, ${r.source}
        )
        ON CONFLICT (ts, chain, protocol) DO UPDATE SET
          total_liquidity   = EXCLUDED.total_liquidity,
          swap_volume_24h   = EXCLUDED.swap_volume_24h,
          swap_fee_24h      = EXCLUDED.swap_fee_24h,
          yield_capture_24h = EXCLUDED.yield_capture_24h,
          surplus_24h       = EXCLUDED.surplus_24h,
          pool_count        = EXCLUDED.pool_count,
          num_lps           = EXCLUDED.num_lps,
          source            = EXCLUDED.source,
          captured_at       = now()
      `
    )
  )
  console.info('[db]', {
    op: 'write',
    helper: `cron/snapshot/upsertRows[n=${rows.length}]`,
    ms: Date.now() - start,
    ok: true,
  })
}

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  await ensureSchemaOnce()

  const ts = Math.floor(Date.now() / 1000 / HOUR_S) * HOUR_S
  const rows: SnapshotRow[] = []
  const skipped: string[] = []
  let error: string | undefined

  try {
    const data = await fetchMetrics()
    // CORE rows: aggregate + per-chain from protocolMetricsAggregated.
    rows.push(coreRow(data.core, ts, AGGREGATE_KEY))
    for (const c of data.core.chains) {
      const chainId = Number.parseInt(c.chainId, 10)
      const chain = Number.isFinite(chainId) ? CHAIN_BY_ID.get(chainId) : undefined
      if (!chain) {
        // Unknown chain id from api-v3 — don't silently fold it into the
        // aggregate by mislabelling. Logged so we can spot new chains.
        skipped.push(c.chainId)
        continue
      }
      rows.push(coreRow(c, ts, chain))
    }
    // COW_AMM rows: rolled up from the pool list.
    rows.push(...aggregateCowAmm(data.cowAmm, ts))
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
