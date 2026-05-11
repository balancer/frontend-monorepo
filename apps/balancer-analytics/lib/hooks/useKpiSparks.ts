'use client'

import { useMemo } from 'react'
import { useProtocolSnapshots } from '@analytics/lib/snapshots/useProtocolSnapshots'
import type { ProtocolSnapshotPoint } from '@analytics/lib/snapshots/types'

export type KpiSpark = {
  /** Numeric series for the sparkline. Empty array if no usable data. */
  values: number[]
  /** Most recent value (matches values.at(-1)). */
  latest: number
  /** Fractional 24h change (0.05 = +5%). null if we can't compute one. */
  delta24h: number | null
}

type Result = {
  loading: boolean
  tvl: KpiSpark
  volume: KpiSpark
  fees: KpiSpark
  yield: KpiSpark
  surplus: KpiSpark
  lps: KpiSpark
  pools: KpiSpark
}

const EMPTY: KpiSpark = { values: [], latest: 0, delta24h: null }
const EMPTY_RESULT: Omit<Result, 'loading'> = {
  tvl: EMPTY,
  volume: EMPTY,
  fees: EMPTY,
  yield: EMPTY,
  surplus: EMPTY,
  lps: EMPTY,
  pools: EMPTY,
}

type Picker = (p: ProtocolSnapshotPoint) => number
type Mode = 'always' | 'nonzero'

/**
 * Build a single KPI series + delta. `mode = 'nonzero'` drops points where the
 * picker returns 0 — DefiLlama backfill rows leave poolCount / numLPs at 0,
 * and including them flatlines the sparkline visually. TVL/volume/fees
 * survive 0-points fine, so they stay on `'always'`.
 */
function deriveSpark(
  points: ProtocolSnapshotPoint[],
  pick: Picker,
  mode: Mode = 'always'
): KpiSpark {
  if (!points.length) return EMPTY
  const values: number[] = []
  for (const p of points) {
    const v = pick(p)
    if (!Number.isFinite(v)) continue
    if (mode === 'nonzero' && v === 0) continue
    values.push(v)
  }
  if (!values.length) return EMPTY
  const latest = values.at(-1)!
  let delta24h: number | null = null
  if (values.length >= 2) {
    const prev = values.at(-2)!
    delta24h = prev > 0 ? (latest - prev) / prev : null
  }
  return { values, latest, delta24h }
}

/**
 * Reads the cron-driven snapshot dataset and slices each metric into a
 * sparkline-ready `{ values, latest, delta24h }`. Shares the snapshot fetch
 * with the TVL chart's `useTvlSeries`, so adding sparklines costs nothing in
 * extra network calls.
 */
export function useKpiSparks({ days = 30 }: { days?: number } = {}): Result {
  const { data, loading } = useProtocolSnapshots({ days })

  const result = useMemo<Omit<Result, 'loading'>>(() => {
    const pts = data.points
    if (!pts.length) return EMPTY_RESULT
    return {
      tvl: deriveSpark(pts, p => p.totalLiquidity),
      volume: deriveSpark(pts, p => p.swapVolume24h),
      fees: deriveSpark(pts, p => p.swapFee24h),
      yield: deriveSpark(pts, p => p.yieldCapture24h, 'nonzero'),
      surplus: deriveSpark(pts, p => p.surplus24h, 'nonzero'),
      // pool_count / num_lps are only populated by api-v3 cron rows; skip the
      // defillama-backfilled days so the spark reflects the actual cadence.
      lps: deriveSpark(pts, p => p.numLiquidityProviders, 'nonzero'),
      pools: deriveSpark(pts, p => p.poolCount, 'nonzero'),
    }
  }, [data])

  return { loading, ...result }
}
