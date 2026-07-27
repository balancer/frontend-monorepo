'use client'

import { useMemo } from 'react'
import {
  useProtocolSnapshots,
  type SnapshotGranularity,
} from '@analytics/lib/snapshots/useProtocolSnapshots'
import type { ProtocolSnapshotPoint } from '@analytics/lib/snapshots/types'

export type Range = '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL'
export type MetricKey = 'TVL' | 'VOLUME' | 'FEES' | 'YIELD' | 'SURPLUS' | 'LPS' | 'POOLS'

// Maps the visible range to the number of days the snapshot endpoint should
// return. Short ranges (24H, 7D) deliberately over-fetch so the v2/v3 ratio
// warmup in `buildSeries` can find a DefiLlama backfill row — only those rows
// carry explicit V2/V3 splits, the hourly api-v3 cron does not. Without the
// warmup, 24H mode renders the entire stack as v2 (and v3 silently vanishes).
// Bonus: 24H/7D/30D now share a snapshot fetch, so switching between them
// hits the cache instead of re-fetching.
const RANGE_DAYS: Record<Range, number> = {
  '24H': 30,
  '7D': 30,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
  ALL: 1825,
}

// Hourly cadence only matters for short windows where intra-day shape is
// actually visible. For 30D+ we collapse server-side to one point per UTC
// day, which is what the chart downsamples to client-side anyway.
const RANGE_GRANULARITY: Record<Range, SnapshotGranularity> = {
  '24H': 'hourly',
  '7D': 'hourly',
  '30D': 'daily',
  '90D': 'daily',
  '1Y': 'daily',
  ALL: 'daily',
}

// Trim points older than the actual visible window. We over-fetch for short
// ranges (see `RANGE_DAYS` above) so the chart's visible cutoff has to be
// applied explicitly — the API's cutoff is broader than what we plot.
const RANGE_VISIBLE_SECONDS: Partial<Record<Range, number>> = {
  '24H': 24 * 60 * 60,
  '7D': 7 * 24 * 60 * 60,
}

// Metrics that were only added to the cron snapshotter recently. Their older
// rows are zero-filled (defillama backfill carries TVL/Volume/Fees only). We
// trim leading zeros so the chart starts at the first day we actually
// captured a value, instead of showing weeks of flat-line zero.
const SPARSE_METRICS: ReadonlySet<MetricKey> = new Set<MetricKey>([
  'YIELD',
  'SURPLUS',
  'LPS',
  'POOLS',
])

export type SeriesPoint = {
  /** Unix milliseconds — feeds straight into ECharts' time axis. */
  t: number
  /** ISO date string, kept for legacy callers / tooltips that want a string. */
  date: string
  /** Total for this point (= v2 + v3 + cow for stacked metrics, else absolute). */
  value: number
  v2: number
  v3: number
  cow: number
}

export type TvlSeries = {
  points: SeriesPoint[]
  change24h: number | null
  /** Whether the active metric splits into v2/v3/cow components. */
  stacked: boolean
  /** True if this metric was recently introduced and its history is short. */
  sparse: boolean
  /** Earliest timestamp (unix ms) where the metric has a non-zero value, or null. */
  firstDataAt: number | null
  /** Number of *real* (non-zero) days in the returned series. */
  realPointCount: number
}

const pickMetric = (p: ProtocolSnapshotPoint, metric: MetricKey): number => {
  switch (metric) {
    case 'TVL':
      return p.totalLiquidity
    case 'VOLUME':
      return p.swapVolume24h
    case 'FEES':
      return p.swapFee24h
    case 'YIELD':
      return p.yieldCapture24h
    case 'SURPLUS':
      return p.surplus24h
    case 'LPS':
      return p.numLiquidityProviders
    case 'POOLS':
      return p.poolCount
  }
}

const pickBreakdownMetric = (
  bd: NonNullable<ProtocolSnapshotPoint['breakdowns']>[keyof NonNullable<
    ProtocolSnapshotPoint['breakdowns']
  >],
  metric: MetricKey
): number | undefined => {
  if (!bd) return undefined
  if (metric === 'TVL') return bd.totalLiquidity
  if (metric === 'VOLUME') return bd.swapVolume24h
  return undefined
}

const isStackedMetric = (metric: MetricKey) => metric === 'TVL' || metric === 'VOLUME'

// Pure transform — extracted so React Compiler doesn't flag the
// forward-filled ratio as a closure mutation across renders.
function buildSeries(
  snapshots: ProtocolSnapshotPoint[],
  range: Range,
  metric: MetricKey
): TvlSeries | null {
  if (!snapshots.length) return null

  // Find the earliest snapshot with a real (non-zero, finite) value for this
  // metric. For sparse metrics this is what we use as the lower bound; for
  // dense metrics (TVL/Volume/Fees) it's just used to populate `firstDataAt`.
  let firstDataIdx = -1
  for (let i = 0; i < snapshots.length; i++) {
    const v = pickMetric(snapshots[i], metric)
    if (Number.isFinite(v) && v > 0) {
      firstDataIdx = i
      break
    }
  }
  const firstDataAt = firstDataIdx >= 0 ? snapshots[firstDataIdx].timestamp * 1000 : null

  const anchor = snapshots.at(-1)!.timestamp
  const days = RANGE_DAYS[range]
  const visibleSeconds = RANGE_VISIBLE_SECONDS[range] ?? days * 24 * 60 * 60
  const rangeCutoff = anchor - visibleSeconds

  // For sparse metrics, clamp the lower bound to the first day we have real
  // data. For dense metrics, honor the requested range as-is.
  const sparse = SPARSE_METRICS.has(metric)
  const effectiveCutoff =
    sparse && firstDataIdx >= 0
      ? Math.max(rangeCutoff, snapshots[firstDataIdx].timestamp)
      : rangeCutoff

  const sliced = snapshots.filter(p => p.timestamp >= effectiveCutoff)
  if (!sliced.length) {
    return {
      points: [],
      change24h: null,
      stacked: isStackedMetric(metric),
      sparse,
      firstDataAt,
      realPointCount: 0,
    }
  }

  const stacked = isStackedMetric(metric)
  // Forward-fill V2/V3 share from explicit breakdowns. Initial ratio assumes
  // 100% v2 (pre-v3 era) so points before the first explicit split don't
  // accidentally show v3 attribution.
  const ratio = { v2: 1, v3: 0, known: false }

  // Warm the ratio from snapshots *before* the visible window. Only the
  // DefiLlama backfill rows carry explicit V2/V3 splits — the hourly api-v3
  // cron rows do not. Short ranges (24H, 7D) often see only cron rows inside
  // their visible slice, so without this preheat the ratio stays at the
  // {v2:1, v3:0} default and v3 silently disappears from the stack. We walk
  // ascending so the final value reflects the *most recent* known split.
  if (stacked) {
    for (const p of snapshots) {
      if (p.timestamp >= effectiveCutoff) break
      const v2 = pickBreakdownMetric(p.breakdowns?.V2, metric)
      const v3 = pickBreakdownMetric(p.breakdowns?.V3, metric)
      if (v2 !== undefined && v3 !== undefined) {
        const sum = v2 + v3
        if (sum > 0) {
          ratio.v2 = v2 / sum
          ratio.v3 = v3 / sum
          ratio.known = true
        }
      }
    }
  }

  const points: SeriesPoint[] = []
  let realPointCount = 0

  for (const p of sliced) {
    const total = pickMetric(p, metric)

    let v2 = 0
    let v3 = 0
    let cow = 0
    if (stacked) {
      cow = pickBreakdownMetric(p.breakdowns?.COW_AMM, metric) ?? 0
      const v2Explicit = pickBreakdownMetric(p.breakdowns?.V2, metric)
      const v3Explicit = pickBreakdownMetric(p.breakdowns?.V3, metric)
      if (v2Explicit !== undefined && v3Explicit !== undefined) {
        v2 = v2Explicit
        v3 = v3Explicit
        const sum = v2 + v3
        if (sum > 0) {
          ratio.v2 = v2 / sum
          ratio.v3 = v3 / sum
          ratio.known = true
        }
      } else {
        const nonCow = Math.max(total - cow, 0)
        if (ratio.known) {
          v2 = nonCow * ratio.v2
          v3 = nonCow * ratio.v3
        } else {
          v2 = nonCow
          v3 = 0
        }
      }
    }

    const t = p.timestamp * 1000
    // For stacked metrics, `value` mirrors the rendered stack so the headline
    // number matches the chart. For non-stacked metrics it's just the picked
    // value.
    const value = stacked ? v2 + v3 + cow : total
    if (Number.isFinite(value) && value > 0) realPointCount++
    points.push({ t, date: new Date(t).toISOString(), value, v2, v3, cow })
  }

  // 24h change is only meaningful when both endpoints carry real values. For
  // sparse metrics with a single real day, suppress the delta.
  let change24h: number | null = null
  if (points.length >= 2) {
    const a = points.at(-1)!.value
    const b = points.at(-2)!.value
    if (b > 0 && Number.isFinite(a)) change24h = (a - b) / b
  }
  return { points, change24h, stacked, sparse, firstDataAt, realPointCount }
}

/**
 * Reads protocol metric history from the cron-driven snapshotter. For TVL and
 * Volume, returns a v2/v3/CoW AMM stack (forward-filling the ratio between
 * explicit breakdown rows). For fees / yield / surplus / LPs / pools, returns
 * the headline aggregate as a single series.
 *
 * For "sparse" metrics (those introduced recently — YIELD, SURPLUS, LPS,
 * POOLS) the series is auto-trimmed to start at the first day we recorded a
 * real value, so the chart doesn't render dozens of zero-filled days from the
 * DefiLlama backfill.
 */
export function useTvlSeries({ range, mode }: { range: Range; mode: MetricKey }): {
  data: TvlSeries | null
  loading: boolean
} {
  const days = RANGE_DAYS[range]
  const granularity = RANGE_GRANULARITY[range]
  const { data: snapshots, loading } = useProtocolSnapshots({ days, granularity })
  const data = useMemo(() => buildSeries(snapshots.points, range, mode), [snapshots, range, mode])
  return { data, loading }
}
