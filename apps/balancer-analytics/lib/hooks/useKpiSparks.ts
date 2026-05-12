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

const DAY_SECONDS = 24 * 60 * 60

/**
 * Build a single KPI series + delta. `mode = 'nonzero'` drops points where the
 * picker returns 0 — DefiLlama backfill rows leave poolCount / numLPs at 0,
 * and including them flatlines the sparkline visually. TVL/volume/fees
 * survive 0-points fine, so they stay on `'always'`.
 *
 * `delta24h` walks back from the latest timestamp to find the first sample
 * at least 24h older. This makes the delta correct regardless of sample
 * cadence: hourly cron snapshots step back ~24 entries, daily backfill rows
 * step back 1. (The old "values.at(-2)" version meant "1h ago" in hourly mode
 * and "1d ago" in daily mode — neither truly 24h.)
 */
function deriveSpark(
  points: ProtocolSnapshotPoint[],
  pick: Picker,
  mode: Mode = 'always'
): KpiSpark {
  if (!points.length) return EMPTY
  const samples: { t: number; v: number }[] = []
  for (const p of points) {
    const v = pick(p)
    if (!Number.isFinite(v)) continue
    if (mode === 'nonzero' && v === 0) continue
    samples.push({ t: p.timestamp, v })
  }
  if (!samples.length) return EMPTY
  const latestSample = samples.at(-1)!
  const latest = latestSample.v

  let prev: number | null = null
  const target = latestSample.t - DAY_SECONDS
  for (let i = samples.length - 2; i >= 0; i--) {
    if (samples[i].t <= target) {
      prev = samples[i].v
      break
    }
  }
  // If the series doesn't reach back a full 24h (sparse metric just started
  // recording), fall back to the second-most-recent sample so we still emit
  // *some* delta rather than null.
  if (prev === null && samples.length >= 2) prev = samples.at(-2)!.v

  const delta24h = prev !== null && prev > 0 ? (latest - prev) / prev : null
  return { values: samples.map(s => s.v), latest, delta24h }
}

/**
 * Reads the cron-driven snapshot dataset and slices each metric into a
 * sparkline-ready `{ values, latest, delta24h }`. Uses `hourly` granularity
 * so the strips render dense and smooth and the 24h delta picks up
 * intra-day movement instead of just yesterday-vs-today.
 */
export function useKpiSparks({ days = 30 }: { days?: number } = {}): Result {
  const { data, loading } = useProtocolSnapshots({ days, granularity: 'hourly' })

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
