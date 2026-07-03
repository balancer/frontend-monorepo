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
 * We fetch three slugs and write four protocol breakdowns per (ts, chain):
 *   - `V2`     = balancer-v2 alone
 *   - `V3`     = balancer-v3 alone
 *   - `COW_AMM` = balancer-cow-amm alone
 *   - `CORE`   = V2 + V3 + COW_AMM   (matches api-v3's "everything it sees"
 *               aggregate; consumers showing a single headline TVL should
 *               read CORE)
 *
 * Chain set: only `PROJECT_CONFIG.supportedNetworks` rows are written, to
 * keep the dataset aligned with the hero KPI (`useProtocolStats`). Chains
 * appearing in DefiLlama but not in supportedNetworks (e.g. Sonic) are
 * skipped and reported under `unmappedChains`.
 *
 * Fields DefiLlama doesn't expose stay at 0 on backfill rows
 * (yieldCapture24h, surplus24h, poolCount, numLiquidityProviders). Charts
 * should treat 0 on `source='defillama'` rows as "unknown", not "zero".
 *
 * Idempotency: `ON CONFLICT DO NOTHING`. Re-running fills gaps and never
 * clobbers a cron row. `?force=1` overwrites existing defillama rows (still
 * won't touch api-v3 rows) and also deletes orphaned defillama rows for any
 * chain that's no longer in supportedNetworks.
 *
 * Auth: same `CRON_SECRET` Bearer as the hourly cron. Not on a Vercel cron
 * schedule — run manually:
 *   curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/backfill
 */

import 'server-only'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  ensureSchemaOnce,
  sql,
  AGGREGATE_KEY,
  PROTOCOL_CORE,
  PROTOCOL_V2,
  PROTOCOL_V3,
  PROTOCOL_COW_AMM,
  SOURCE_DEFILLAMA,
  type Protocol,
  type SnapshotRow,
} from '@analytics/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const DAY_S = 24 * 60 * 60

// Slug → protocol. The order here also defines fetch order; CORE is derived
// from the three slug pivots at write time.
const SLUG_TO_PROTOCOL = {
  'balancer-v2': PROTOCOL_V2,
  'balancer-v3': PROTOCOL_V3,
  'balancer-cow-amm': PROTOCOL_COW_AMM,
} as const
type Slug = keyof typeof SLUG_TO_PROTOCOL
const SLUGS = Object.keys(SLUG_TO_PROTOCOL) as Slug[]

// DefiLlama chain name → GqlChain enum. Protocol-TVL responses use
// "Optimism"; dex/fees breakdowns use "OP Mainnet" — both alias. "xDai" is
// DefiLlama's legacy name for Gnosis Chain.
const CHAIN_MAP: Record<string, GqlChain> = {
  Ethereum: GqlChainValues.Mainnet,
  Arbitrum: GqlChainValues.Arbitrum,
  Base: GqlChainValues.Base,
  Avalanche: GqlChainValues.Avalanche,
  Gnosis: GqlChainValues.Gnosis,
  xDai: GqlChainValues.Gnosis,
  Polygon: GqlChainValues.Polygon,
  'Polygon zkEVM': GqlChainValues.Zkevm,
  Optimism: GqlChainValues.Optimism,
  'OP Mainnet': GqlChainValues.Optimism,
  Sonic: GqlChainValues.Sonic,
  Fraxtal: GqlChainValues.Fraxtal,
  Mode: GqlChainValues.Mode,
  Monad: GqlChainValues.Monad,
  'Hyperliquid L1': GqlChainValues.Hyperevm,
  Plasma: GqlChainValues.Plasma,
}

const SUPPORTED = new Set<GqlChain>(PROJECT_CONFIG.supportedNetworks)

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

// Merge `src` into `dst`, adding bucket values. Used to derive CORE from
// the three slug pivots without re-fetching.
function mergePivot(dst: DayMap, src: DayMap) {
  for (const [ts, byChain] of src) {
    const day = ensureDay(dst, ts)
    for (const [chain, b] of byChain) {
      const target = getBucket(day, chain)
      target.tvl += b.tvl
      target.volume += b.volume
      target.fees += b.fees
    }
  }
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
  return fetchJson<DexSummary>(`https://api.llama.fi/summary/dexs/${slug}?dataType=dailyVolume`)
}

async function fetchFees(slug: Slug): Promise<DexSummary | null> {
  return fetchJson<DexSummary>(`https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`)
}

// --- folding into a (day, chain) pivot -------------------------------------

type FoldCtx = { unknown: Set<string>; unmapped: Set<string> }

function resolveChain(chainName: string, ctx: FoldCtx): GqlChain | null {
  const chain = CHAIN_MAP[chainName]
  if (!chain) {
    ctx.unknown.add(chainName)
    return null
  }
  if (!SUPPORTED.has(chain)) {
    ctx.unmapped.add(chainName)
    return null
  }
  return chain
}

function foldTvl(pivot: DayMap, data: ProtocolTvl | null, ctx: FoldCtx) {
  if (!data?.chainTvls) return
  for (const [chainName, ct] of Object.entries(data.chainTvls)) {
    // DefiLlama uses "*" aliases for borrowed/staked tvl variants (e.g.
    // "Ethereum-borrowed"). They double-count, skip them.
    if (chainName.includes('-')) continue
    const chain = resolveChain(chainName, ctx)
    if (!chain) continue
    // DefiLlama can publish multiple TVL points for the in-flight day — a
    // canonical 00:00 snapshot plus a fresher mid-day refresh — both falling
    // into the same midnight-UTC bucket. Summing them double-counts today.
    // Keep only the latest point per bucket per chain.
    const latestByDay = new Map<number, { rawDate: number; value: number }>()
    for (const point of ct.tvl ?? []) {
      const ts = midnightUtc(point.date)
      const value = Number(point.totalLiquidityUSD) || 0
      const cur = latestByDay.get(ts)
      if (!cur || point.date > cur.rawDate) {
        latestByDay.set(ts, { rawDate: point.date, value })
      }
    }
    for (const [ts, { value }] of latestByDay) {
      const day = ensureDay(pivot, ts)
      getBucket(day, chain).tvl += value
      getBucket(day, AGGREGATE_KEY).tvl += value
    }
  }
}

function foldBreakdown(
  pivot: DayMap,
  data: DexSummary | null,
  ctx: FoldCtx,
  field: 'volume' | 'fees'
) {
  if (!data?.totalDataChartBreakdown) return
  for (const [rawTs, byChain] of data.totalDataChartBreakdown) {
    const ts = midnightUtc(Number(rawTs))
    const day = ensureDay(pivot, ts)
    for (const [chainName, byProduct] of Object.entries(byChain)) {
      const chain = resolveChain(chainName, ctx)
      if (!chain) continue
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
  // Chunk + parallelize. A large backfill is many chunks of 500 — running
  // them serially over Neon's HTTP driver takes minutes and trips Vercel's
  // 60s edge timeout even though the function's maxDuration is higher.
  // Promise.all here cuts wall time roughly proportional to PARALLELISM.
  // Neon serverless tolerates this — each transaction is a single HTTP req.
  const CHUNK = 500
  const PARALLELISM = 6
  const chunks: SnapshotRow[][] = []
  for (let i = 0; i < rows.length; i += CHUNK) chunks.push(rows.slice(i, i + CHUNK))
  for (let i = 0; i < chunks.length; i += PARALLELISM) {
    const batch = chunks.slice(i, i + PARALLELISM)
    await Promise.all(
      batch.map(slice =>
        sql.transaction(
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
      )
    )
  }
}

// Drop rows for chains that are no longer in supportedNetworks. Only run
// with `?force=1` — destructive, gated explicitly.
//
// Defillama rows: delete per-chain rows for unsupported chains.
//
// Api-v3 cron rows: more delicate. A cron tick wrote both the per-chain
// rows AND an 'ALL' aggregate computed across whatever chain set the cron
// was configured with at the time. If the chain set changes, both the
// per-chain orphans AND the now-stale aggregate need to go — the aggregate
// can't be retroactively recomputed because api-v3 doesn't expose history.
// We delete every api-v3 row at any timestamp that has at least one
// unsupported-chain row; the next cron tick will write a fresh, correctly
// scoped aggregate.
async function purgeUnsupported(): Promise<{ defillama: number; apiv3: number }> {
  const supported = [AGGREGATE_KEY, ...PROJECT_CONFIG.supportedNetworks]
  const dl = (await sql`
    DELETE FROM protocol_snapshots
    WHERE source = 'defillama'
      AND chain <> ALL(${supported}::text[])
    RETURNING ts
  `) as { ts: string }[]

  // Find timestamps where api-v3 wrote an unsupported-chain row.
  const stale = (await sql`
    SELECT DISTINCT ts FROM protocol_snapshots
    WHERE source = 'api-v3'
      AND chain <> ALL(${supported}::text[])
  `) as { ts: string }[]
  if (stale.length === 0) return { defillama: dl.length, apiv3: 0 }
  const staleTs = stale.map(r => Number(r.ts))
  const apiv3 = (await sql`
    DELETE FROM protocol_snapshots
    WHERE source = 'api-v3'
      AND ts = ANY(${staleTs}::bigint[])
    RETURNING ts
  `) as { ts: string }[]
  return { defillama: dl.length, apiv3: apiv3.length }
}

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  const url = new URL(req.url)
  const force = url.searchParams.get('force') === '1'

  await ensureSchemaOnce()

  const ctx: FoldCtx = { unknown: new Set(), unmapped: new Set() }
  const rowsByProtocol: Record<Protocol, SnapshotRow[]> = {
    [PROTOCOL_CORE]: [],
    [PROTOCOL_V2]: [],
    [PROTOCOL_V3]: [],
    [PROTOCOL_COW_AMM]: [],
  }
  let purged: { defillama: number; apiv3: number } = { defillama: 0, apiv3: 0 }
  let error: string | undefined

  try {
    const [protocols, dexes, fees] = await Promise.all([
      Promise.all(SLUGS.map(fetchProtocol)),
      Promise.all(SLUGS.map(fetchDex)),
      Promise.all(SLUGS.map(fetchFees)),
    ])

    // Per-slug pivot — directly maps to V2 / V3 / COW_AMM rows.
    const slugPivots: DayMap[] = SLUGS.map(() => new Map())
    for (let i = 0; i < SLUGS.length; i++) {
      foldTvl(slugPivots[i], protocols[i], ctx)
      foldBreakdown(slugPivots[i], dexes[i], ctx, 'volume')
      foldBreakdown(slugPivots[i], fees[i], ctx, 'fees')
      const protocol = SLUG_TO_PROTOCOL[SLUGS[i]]
      rowsByProtocol[protocol] = pivotToRows(slugPivots[i], protocol)
    }

    // CORE = V2 + V3 + COW_AMM. Build by merging the three slug pivots.
    const corePivot: DayMap = new Map()
    for (const p of slugPivots) mergePivot(corePivot, p)
    rowsByProtocol[PROTOCOL_CORE] = pivotToRows(corePivot, PROTOCOL_CORE)

    const all = [
      ...rowsByProtocol[PROTOCOL_CORE],
      ...rowsByProtocol[PROTOCOL_V2],
      ...rowsByProtocol[PROTOCOL_V3],
      ...rowsByProtocol[PROTOCOL_COW_AMM],
    ]
    await upsertRows(all, force)
    if (force) purged = await purgeUnsupported()
  } catch (e) {
    error = String(e)
  }

  return Response.json({
    ok: !error,
    force,
    rowsByProtocol: {
      CORE: rowsByProtocol[PROTOCOL_CORE].length,
      V2: rowsByProtocol[PROTOCOL_V2].length,
      V3: rowsByProtocol[PROTOCOL_V3].length,
      COW_AMM: rowsByProtocol[PROTOCOL_COW_AMM].length,
    },
    purged,
    unknownChains: Array.from(ctx.unknown).sort(),
    unmappedChains: Array.from(ctx.unmapped).sort(),
    error,
    ranAt: new Date().toISOString(),
  })
}
