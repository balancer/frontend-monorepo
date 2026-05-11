'use client'

import { useMemo } from 'react'
import { useProtocolSnapshots } from '@analytics/lib/snapshots/useProtocolSnapshots'
import type { ProtocolSnapshotPoint } from '@analytics/lib/snapshots/types'

type Range = '7D' | '30D' | '90D' | '1Y' | 'ALL'
type Mode = 'TVL' | 'VOLUME'

const RANGE_DAYS: Record<Range, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
  ALL: 1825,
}

export type SeriesPoint = {
  /** Unix milliseconds — feeds straight into ECharts' time axis. */
  t: number
  /** ISO date string, kept for legacy callers / tooltips that want a string. */
  date: string
  /** CORE total (= v2 + v3 + cow). */
  value: number
  v2: number
  v3: number
  cow: number
}

export type TvlSeries = {
  points: SeriesPoint[]
  change24h: number | null
}

const pickMetric = (p: ProtocolSnapshotPoint, mode: Mode) =>
  mode === 'TVL' ? p.totalLiquidity : p.swapVolume24h

const pickBreakdownMetric = (
  bd: NonNullable<ProtocolSnapshotPoint['breakdowns']>[keyof NonNullable<ProtocolSnapshotPoint['breakdowns']>],
  mode: Mode
): number | undefined => {
  if (!bd) return undefined
  return mode === 'TVL' ? bd.totalLiquidity : bd.swapVolume24h
}

// Pure transform — extracted so React Compiler doesn't flag the
// forward-filled ratio as a closure mutation across renders.
function buildSeries(
  snapshots: ProtocolSnapshotPoint[],
  days: number,
  mode: Mode
): TvlSeries | null {
  if (!snapshots.length) return null
  const anchor = snapshots.at(-1)!.timestamp
  const cutoff = anchor - days * 24 * 60 * 60
  const sliced = snapshots.filter(p => p.timestamp >= cutoff)
  if (!sliced.length) return null

  // Forward-fill V2/V3 share from explicit breakdowns. Initial ratio assumes
  // 100% v2 (pre-v3 era) so points before the first explicit split don't
  // accidentally show v3 attribution.
  const ratio = { v2: 1, v3: 0, known: false }
  const points: SeriesPoint[] = []

  for (const p of sliced) {
    const total = pickMetric(p, mode)
    const cow = pickBreakdownMetric(p.breakdowns?.COW_AMM, mode) ?? 0
    const v2Explicit = pickBreakdownMetric(p.breakdowns?.V2, mode)
    const v3Explicit = pickBreakdownMetric(p.breakdowns?.V3, mode)

    let v2: number
    let v3: number
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

    const t = p.timestamp * 1000
    // `value` reflects the visible stack so the headline number always equals
    // what the chart draws. CORE in the DB may understate the day if a manual
    // gap-fill row was added after the original capture (DefiLlama missed v2
    // for some days; manual rows land in `breakdowns.V2` only).
    points.push({ t, date: new Date(t).toISOString(), value: v2 + v3 + cow, v2, v3, cow })
  }

  let change24h: number | null = null
  if (points.length >= 2) {
    const a = points.at(-1)!.value
    const b = points.at(-2)!.value
    change24h = b > 0 ? (a - b) / b : null
  }
  return { points, change24h }
}

/**
 * Reads protocol TVL/Volume history from the cron-driven snapshotter and
 * splits each point into v2 / v3 / CoW AMM sub-series.
 *
 * Backfilled DefiLlama rows carry an explicit V2/V3/COW_AMM breakdown — those
 * are used verbatim. Hourly api-v3 rows only carry COW_AMM; for those we
 * carry forward the last known v2/v3 ratio and apply it to (CORE − cow). This
 * keeps the stack continuous; the approximation is acceptable for the visual
 * "v3 dominance" story since v2/v3 share moves slowly day-to-day.
 */
export function useTvlSeries({
  range,
  mode,
}: {
  range: Range
  mode: Mode
}): { data: TvlSeries | null; loading: boolean } {
  const days = RANGE_DAYS[range]
  const { data: snapshots, loading } = useProtocolSnapshots({ days })
  const data = useMemo(() => buildSeries(snapshots.points, days, mode), [snapshots, days, mode])
  return { data, loading }
}
