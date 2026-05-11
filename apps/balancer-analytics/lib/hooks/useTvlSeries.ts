'use client'

import { useMemo } from 'react'
import { useProtocolSnapshots } from '@analytics/lib/snapshots/useProtocolSnapshots'

type Range = '7D' | '30D' | '90D' | '1Y' | 'ALL'
type Mode = 'TVL' | 'VOLUME'

const RANGE_DAYS: Record<Range, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
  ALL: 1825,
}

export type SeriesPoint = { date: string; value: number }
export type TvlSeries = { points: SeriesPoint[]; change24h: number | null }

/**
 * Reads protocol TVL/Volume history from the cron-driven snapshotter.
 *
 * Snapshots arrive hourly (see `app/api/cron/snapshot/route.ts`); we slice
 * by timestamp rather than point count so a 7D request reliably returns the
 * last 7 days of points regardless of cadence changes.
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

  const result = useMemo<TvlSeries | null>(() => {
    const pts = snapshots.points
    if (!pts.length) return null

    // Anchor the window on the most recent capture, not `Date.now()`. Keeps
    // useMemo pure (lint: react-hooks/purity) and stays correct if the cron
    // is briefly behind.
    const anchor = pts.at(-1)!.timestamp
    const cutoff = anchor - days * 24 * 60 * 60
    const sliced = pts.filter(p => p.timestamp >= cutoff)
    const points: SeriesPoint[] = sliced.map(p => ({
      date: new Date(p.timestamp * 1000).toISOString(),
      value: mode === 'TVL' ? p.totalLiquidity : p.swapVolume24h,
    }))
    if (points.length < 2) return { points, change24h: null }
    const a = points.at(-1)!.value
    const b = points.at(-2)!.value
    return { points, change24h: b > 0 ? (a - b) / b : null }
  }, [snapshots, days, mode])

  return { data: result, loading }
}
