/**
 * One-shot historical backfill from DefiLlama.
 *
 * api-v3 only exposes point-in-time metrics, so the snapshot table grows
 * forward from cron's first run. To get history we hit DefiLlama's free
 * REST API and write daily rows at midnight UTC.
 *
 * What DefiLlama gives us per (date, chain):
 *   - `/protocol/{slug}` → TVL via `chainTvls[chain].tvl[].totalLiquidityUSD`
 *   - `/summary/dexs/{slug}?dataType=dailyVolume` → swap volume
 *   - `/summary/fees/{slug}?dataType=dailyFees`   → swap fees
 *
 * We fetch three slugs and combine:
 *   - `CORE`   = balancer-v2 + balancer-v3 + balancer-cow-amm  (matches
 *               api-v3's "everything it sees" definition)
 *   - `COW_AMM` = balancer-cow-amm alone
 *
 * Fields DefiLlama doesn't expose stay at 0 on backfill rows
 * (yieldCapture24h, surplus24h, poolCount, numLiquidityProviders). Charts
 * should treat 0 on `source='defillama'` rows as "unknown", not "zero".
 *
 * Idempotency: `ON CONFLICT DO NOTHING`. Re-running fills gaps and never
 * clobbers a cron row. `?force=1` overwrites existing defillama rows (still
 * won't touch api-v3 rows).
 *
 * Auth: same `CRON_SECRET` Bearer as the hourly cron. Not on a Vercel cron
 * schedule — run manually after first deploy:
 *   curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/backfill
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  ensureSchema,
  sql,
  AGGREGATE_KEY,
  PROTOCOL_CORE,
  PROTOCOL_COW_AMM,
  SOURCE_DEFILLAMA,
  type Protocol,
  type SnapshotRow,
} from '@analytics/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const DAY_S = 24 * 60 * 60
const SLUGS = ['balancer-v2', 'balancer-v3', 'balancer-cow-amm'] as const
type Slug = (typeof SLUGS)[number]
const COW_AMM_SLUG: Slug = 'balancer-cow-amm'

// DefiLlama chain name → GqlChain enum. Some endpoints (protocol TVL) use
// "Optimism" while others (dex summaries) use "OP Mainnet" — handle both.
// "xDai" is DefiLlama's legacy name for Gnosis Chain.
const CHAIN_MAP: Record<string, GqlChain> = {
  Ethereum: GqlChain.Mainnet,
  Arbitrum: GqlChain.Arbitrum,
  Base: GqlChain.Base,
  Avalanche: GqlChain.Avalanche,
  Gnosis: GqlChain.Gnosis,
  xDai: GqlChain.Gnosis,
  Polygon: GqlChain.Polygon,
  'Polygon zkEVM': GqlChain.Zkevm,
  Optimism: GqlChain.Optimism,
  'OP Mainnet': GqlChain.Optimism,
  Sonic: GqlChain.Sonic,
  Fraxtal: GqlChain.Fraxtal,
  Mode: GqlChain.Mode,
  Monad: GqlChain.Monad,
  'Hyperliquid L1': GqlChain.Hyperevm,
  Plasma: GqlChain.Plasma,
}

type Bucket = { tvl: number; volume: number; fees: number }
type DayMap = Map<number, Map<GqlChain | typeof AGGREGATE_KEY, Bucket>>

function midnightUtc(unixSeconds: number): number {
  return Math.floor(unixSeconds / DAY_S) * DAY_S
}

function emptyBucket(): Bucket {
  return { tvl: 0, volume: 0, fees: 0 }
}

function getBucket(
  map: Map<GqlChain | typeof AGGREGATE_KEY, Bucket>,
  key: GqlChain | typeof AGGREGATE_KEY
): Bucket {
  let b = map.get(key)
  if (!b) {
    b = emptyBucket()
    map.set(key, b)
  }
  return b
}

function ensureDay(pivot: DayMap, ts: number) {
  let m = pivot.get(ts)
  if (!m) {
    m = new Map()
    pivot.set(ts, m)
  }
  return m
}

// --- DefiLlama fetchers ----------------------------------------------------

type ProtocolTvl = {
  chainTvls?: Record<string, { tvl?: { date: number; totalLiquidityUSD: number }[] }>
}
type DexSummary = {
  totalDataChartBreakdown?: [number, Record<string, Record<string, number>>][]
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  return (await res.json()) as T
}

async function fetchProtocol(slug: Slug): Promise<ProtocolTvl | null> {
  return fetchJson<ProtocolTvl>(`https://api.llama.fi/protocol/${slug}`)
}

async function fetchDex(slug: Slug): Promise<DexSummary | null> {
  return fetchJson<DexSummary>(
    `https://api.llama.fi/summary/dexs/${slug}?dataType=dailyVolume`
  )
}

async function fetchFees(slug: Slug): Promise<DexSummary | null> {
  return fetchJson<DexSummary>(
    `https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`
  )
}

// --- folding into a (day, chain) pivot -------------------------------------

function foldTvl(pivot: DayMap, data: ProtocolTvl | null, unknown: Set<string>) {
  if (!data?.chainTvls) return
  for (const [chainName, ct] of Object.entries(data.chainTvls)) {
    const chain = CHAIN_MAP[chainName]
    // DefiLlama uses "*" aliases for borrowed/staked tvl variants (e.g.
    // "Ethereum-borrowed"). They double-count, skip them.
    if (chainName.includes('-')) continue
    if (!chain) {
      unknown.add(chainName)
      continue
    }
    for (const point of ct.tvl ?? []) {
      const ts = midnightUtc(point.date)
      const day = ensureDay(pivot, ts)
      const value = Number(point.totalLiquidityUSD) || 0
      getBucket(day, chain).tvl += value
      getBucket(day, AGGREGATE_KEY).tvl += value
    }
  }
}

function foldBreakdown(
  pivot: DayMap,
  data: DexSummary | null,
  unknown: Set<string>,
  field: 'volume' | 'fees'
) {
  if (!data?.totalDataChartBreakdown) return
  for (const [rawTs, byChain] of data.totalDataChartBreakdown) {
    const ts = midnightUtc(Number(rawTs))
    const day = ensureDay(pivot, ts)
    for (const [chainName, byProduct] of Object.entries(byChain)) {
      const chain = CHAIN_MAP[chainName]
      if (!chain) {
        unknown.add(chainName)
        continue
      }
      const total = Object.values(byProduct).reduce((a, b) => a + (Number(b) || 0), 0)
      getBucket(day, chain)[field] += total
      getBucket(day, AGGREGATE_KEY)[field] += total
    }
  }
}

function pivotToRows(pivot: DayMap, protocol: Protocol): SnapshotRow[] {
  const rows: SnapshotRow[] = []
  for (const [ts, byChain] of pivot) {
    for (const [chain, b] of byChain) {
      // Skip empty buckets (e.g. a chain only had volume on a day, no TVL).
      if (b.tvl === 0 && b.volume === 0 && b.fees === 0) continue
      rows.push({
        ts,
        chain,
        protocol,
        totalLiquidity: b.tvl,
        swapVolume24h: b.volume,
        swapFee24h: b.fees,
        yieldCapture24h: 0,
        surplus24h: 0,
        poolCount: 0,
        numLps: 0,
        source: SOURCE_DEFILLAMA,
      })
    }
  }
  return rows
}

// --- write ------------------------------------------------------------------

async function upsertRows(rows: SnapshotRow[], force: boolean): Promise<void> {
  if (rows.length === 0) return
  // Neon's HTTP transaction has a per-request size budget — chunk to keep
  // each round-trip reasonable. ~500 statements per chunk is well within
  // limits and means a 2,000-day backfill is ~10 round trips.
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK)
    await sql.transaction(
      slice.map(r => {
        if (force) {
          // Force mode: overwrite only rows already marked defillama. Never
          // clobber api-v3 cron data.
          return sql`
            INSERT INTO protocol_snapshots (
              ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
              yield_capture_24h, surplus_24h, pool_count, num_lps, source
            ) VALUES (
              ${r.ts}, ${r.chain}, ${r.protocol}, ${r.totalLiquidity}, ${r.swapVolume24h},
              ${r.swapFee24h}, ${r.yieldCapture24h}, ${r.surplus24h},
              ${r.poolCount}, ${r.numLps}, ${r.source}
            )
            ON CONFLICT (ts, chain, protocol) DO UPDATE SET
              total_liquidity = EXCLUDED.total_liquidity,
              swap_volume_24h = EXCLUDED.swap_volume_24h,
              swap_fee_24h    = EXCLUDED.swap_fee_24h,
              captured_at     = now()
            WHERE protocol_snapshots.source = 'defillama'
          `
        }
        return sql`
          INSERT INTO protocol_snapshots (
            ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
            yield_capture_24h, surplus_24h, pool_count, num_lps, source
          ) VALUES (
            ${r.ts}, ${r.chain}, ${r.protocol}, ${r.totalLiquidity}, ${r.swapVolume24h},
            ${r.swapFee24h}, ${r.yieldCapture24h}, ${r.surplus24h},
            ${r.poolCount}, ${r.numLps}, ${r.source}
          )
          ON CONFLICT (ts, chain, protocol) DO NOTHING
        `
      })
    )
  }
}

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  const url = new URL(req.url)
  const force = url.searchParams.get('force') === '1'

  await ensureSchema()

  const unknownChains = new Set<string>()
  let coreRows: SnapshotRow[] = []
  let cowAmmRows: SnapshotRow[] = []
  let error: string | undefined

  try {
    const [protocols, dexes, fees] = await Promise.all([
      Promise.all(SLUGS.map(fetchProtocol)),
      Promise.all(SLUGS.map(fetchDex)),
      Promise.all(SLUGS.map(fetchFees)),
    ])

    // CORE pivot: sum across all 3 slugs.
    const corePivot: DayMap = new Map()
    for (let i = 0; i < SLUGS.length; i++) {
      foldTvl(corePivot, protocols[i], unknownChains)
      foldBreakdown(corePivot, dexes[i], unknownChains, 'volume')
      foldBreakdown(corePivot, fees[i], unknownChains, 'fees')
    }
    coreRows = pivotToRows(corePivot, PROTOCOL_CORE)

    // COW_AMM pivot: balancer-cow-amm slug alone.
    const cowIdx = SLUGS.indexOf(COW_AMM_SLUG)
    const cowPivot: DayMap = new Map()
    foldTvl(cowPivot, protocols[cowIdx], unknownChains)
    foldBreakdown(cowPivot, dexes[cowIdx], unknownChains, 'volume')
    foldBreakdown(cowPivot, fees[cowIdx], unknownChains, 'fees')
    cowAmmRows = pivotToRows(cowPivot, PROTOCOL_COW_AMM)

    await upsertRows([...coreRows, ...cowAmmRows], force)
  } catch (e) {
    error = String(e)
  }

  return Response.json({
    ok: !error,
    force,
    coreRows: coreRows.length,
    cowAmmRows: cowAmmRows.length,
    unknownChains: Array.from(unknownChains).sort(),
    error,
    ranAt: new Date().toISOString(),
  })
}
