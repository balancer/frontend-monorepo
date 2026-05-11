/**
 * Public read endpoint for the protocol snapshot series.
 *
 * Returns `ProtocolSnapshotSeries` (see `lib/snapshots/types.ts`) — the shape
 * `useProtocolSnapshots()` is coded against. One DB row per
 * `(ts, chain, protocol)`; we fold them back into one `ProtocolSnapshotPoint`
 * per timestamp:
 *   - `protocol = 'CORE'`, `chain = 'ALL'` → top-level fields
 *   - `protocol = 'CORE'`, `chain = ...`   → `byChain[...]`
 *   - `protocol = 'COW_AMM'`               → `cowAmm` breakdown
 *
 * `?days=N` bounds the window (default 90, max ~5y). Hourly cron writes are
 * ~24×11 rows/day for CORE plus ~24×5 rows/day for COW_AMM; a 90-day query
 * scans ~35k rows behind the `(ts)` index — fine.
 *
 * Cached `revalidate = 600` (10 min). Cron writes hourly, so up to 10 min
 * staleness is well under the snapshot cadence.
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { sql, AGGREGATE_KEY, PROTOCOL_CORE, PROTOCOL_COW_AMM } from '@analytics/lib/db'
import type {
  ChainSnapshotPoint,
  CowAmmBreakdown,
  ProtocolSnapshotPoint,
  ProtocolSnapshotSeries,
  SnapshotSource,
} from '@analytics/lib/snapshots/types'

export const runtime = 'nodejs'
export const revalidate = 600

const DEFAULT_DAYS = 90
const MAX_DAYS = 365 * 5

type DbRow = {
  ts: string
  chain: string
  protocol: string
  total_liquidity: string
  swap_volume_24h: string
  swap_fee_24h: string
  yield_capture_24h: string
  surplus_24h: string
  pool_count: number
  num_lps: number
  source: string
}

function chainMetrics(r: DbRow): ChainSnapshotPoint {
  return {
    totalLiquidity: Number.parseFloat(r.total_liquidity),
    swapVolume24h: Number.parseFloat(r.swap_volume_24h),
    swapFee24h: Number.parseFloat(r.swap_fee_24h),
    yieldCapture24h: Number.parseFloat(r.yield_capture_24h),
    surplus24h: Number.parseFloat(r.surplus_24h),
    poolCount: r.pool_count,
    numLiquidityProviders: r.num_lps,
  }
}

function emptyCowAmm(): CowAmmBreakdown {
  return {
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    byChain: {},
  }
}

function emptyPoint(ts: number): ProtocolSnapshotPoint {
  return {
    timestamp: ts,
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    numLiquidityProviders: 0,
    byChain: {},
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const requested = Number(url.searchParams.get('days'))
  const days = Number.isFinite(requested) && requested > 0
    ? Math.min(MAX_DAYS, Math.round(requested))
    : DEFAULT_DAYS
  const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60

  const rows = (await sql`
    SELECT ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
           yield_capture_24h, surplus_24h, pool_count, num_lps, source
    FROM protocol_snapshots
    WHERE ts >= ${cutoff}
    ORDER BY ts ASC
  `) as DbRow[]

  const byTs = new Map<number, ProtocolSnapshotPoint>()
  for (const r of rows) {
    const ts = Number(r.ts)
    let p = byTs.get(ts)
    if (!p) {
      p = emptyPoint(ts)
      byTs.set(ts, p)
    }
    const m = chainMetrics(r)
    if (r.protocol === PROTOCOL_CORE) {
      if (r.chain === AGGREGATE_KEY) {
        p.totalLiquidity = m.totalLiquidity
        p.swapVolume24h = m.swapVolume24h
        p.swapFee24h = m.swapFee24h
        p.yieldCapture24h = m.yieldCapture24h
        p.surplus24h = m.surplus24h
        p.poolCount = m.poolCount
        p.numLiquidityProviders = m.numLiquidityProviders
        p.source = r.source as SnapshotSource
      } else {
        ;(p.byChain as Record<string, ChainSnapshotPoint>)[r.chain as GqlChain] = m
      }
    } else if (r.protocol === PROTOCOL_COW_AMM) {
      if (!p.cowAmm) p.cowAmm = emptyCowAmm()
      if (r.chain === AGGREGATE_KEY) {
        p.cowAmm.totalLiquidity = m.totalLiquidity
        p.cowAmm.swapVolume24h = m.swapVolume24h
        p.cowAmm.swapFee24h = m.swapFee24h
        p.cowAmm.yieldCapture24h = m.yieldCapture24h
        p.cowAmm.surplus24h = m.surplus24h
        p.cowAmm.poolCount = m.poolCount
      } else {
        ;(p.cowAmm.byChain as Record<string, ChainSnapshotPoint>)[
          r.chain as GqlChain
        ] = m
      }
    }
  }

  const points = Array.from(byTs.values())
  const series: ProtocolSnapshotSeries = {
    points,
    generatedAt: points.at(-1)?.timestamp ?? null,
  }
  return Response.json(series)
}
