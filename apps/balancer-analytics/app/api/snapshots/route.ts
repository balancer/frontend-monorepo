/**
 * Public read endpoint for the protocol snapshot series.
 *
 * Returns `ProtocolSnapshotSeries` (see `lib/snapshots/types.ts`) — the shape
 * the existing `useProtocolSnapshots()` reader is already coded against.
 * One row per `(ts, chain)` in the table; we fold them back into one
 * `ProtocolSnapshotPoint` per timestamp with the aggregate values on the
 * top-level fields and the per-chain values under `byChain`.
 *
 * `?days=N` bounds the window (default 90, max ~5y). With hourly writes the
 * default returns ~2,160 points × ~11 rows each — ~24k DB rows scanned via
 * the (ts) index. Fine.
 *
 * Cached with `revalidate = 600` (10 min). Cron writes hourly, so a stale
 * read window of up to 10 min is well under the snapshot cadence.
 */

import 'server-only'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { sql } from '@analytics/lib/db'
import type {
  ChainSnapshotPoint,
  ProtocolSnapshotPoint,
  ProtocolSnapshotSeries,
} from '@analytics/lib/snapshots/types'

export const runtime = 'nodejs'
export const revalidate = 600

const DEFAULT_DAYS = 90
const MAX_DAYS = 365 * 5

type DbRow = {
  ts: string
  chain: string
  total_liquidity: string
  swap_volume_24h: string
  swap_fee_24h: string
  yield_capture_24h: string
  surplus_24h: string
  pool_count: number
  num_lps: number
}

function metricsFromRow(r: DbRow) {
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
    SELECT ts, chain, total_liquidity, swap_volume_24h, swap_fee_24h,
           yield_capture_24h, surplus_24h, pool_count, num_lps
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
    const m = metricsFromRow(r)
    if (r.chain === 'ALL') {
      p.totalLiquidity = m.totalLiquidity
      p.swapVolume24h = m.swapVolume24h
      p.swapFee24h = m.swapFee24h
      p.yieldCapture24h = m.yieldCapture24h
      p.surplus24h = m.surplus24h
      p.poolCount = m.poolCount
      p.numLiquidityProviders = m.numLiquidityProviders
    } else {
      ;(p.byChain as Record<string, ChainSnapshotPoint>)[r.chain as GqlChain] = m
    }
  }

  const points = Array.from(byTs.values())
  const series: ProtocolSnapshotSeries = {
    points,
    generatedAt: points.at(-1)?.timestamp ?? null,
  }
  return Response.json(series)
}
