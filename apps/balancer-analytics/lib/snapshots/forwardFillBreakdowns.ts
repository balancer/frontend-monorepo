/**
 * Forward-fill V2/V3 protocol breakdowns onto snapshot points that only have
 * CORE (+ optional COW_AMM).
 *
 * Why this exists:
 *   The hourly api-v3 cron writes CORE + COW_AMM only — it cannot emit a clean
 *   V2/V3 split (BPT double-count). Explicit V2/V3 rows come from the DefiLlama
 *   backfill. When that backfill lags (or a chart window simply doesn't reach
 *   the last DefiLlama day), `useTvlSeries` defaults the stack to 100% v2 /
 *   0% v3 and Balancer v3 silently disappears from the Protocol Metrics chart.
 *
 * Strategy:
 *   Walk points ascending. Whenever an explicit V2+V3 pair is present, remember
 *   its TVL/volume share. For subsequent points missing that pair, attribute
 *   `(CORE − COW)` using the last known share so the stacked total still
 *   matches the api-v3 headline.
 *
 *   Callers that have no in-window seed should pass `seed` from the most recent
 *   V2/V3 ALL-chain rows in Postgres (see `/api/snapshots`).
 */

import type { ProtocolBreakdown, ProtocolSnapshotPoint } from './types'

export type VersionBreakdownSeed = {
  v2: Pick<ProtocolBreakdown, 'totalLiquidity' | 'swapVolume24h' | 'swapFee24h'>
  v3: Pick<ProtocolBreakdown, 'totalLiquidity' | 'swapVolume24h' | 'swapFee24h'>
}

function emptyBreakdown(
  partial: Pick<ProtocolBreakdown, 'totalLiquidity' | 'swapVolume24h' | 'swapFee24h'>
): ProtocolBreakdown {
  return {
    totalLiquidity: partial.totalLiquidity,
    swapVolume24h: partial.swapVolume24h,
    swapFee24h: partial.swapFee24h,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    byChain: {},
  }
}

function hasExplicitPair(p: ProtocolSnapshotPoint): boolean {
  return p.breakdowns?.V2 !== undefined && p.breakdowns?.V3 !== undefined
}

/**
 * Mutates `points` in place. Returns the number of points that received a
 * synthetic V2/V3 pair.
 */
export function forwardFillVersionBreakdowns(
  points: ProtocolSnapshotPoint[],
  seed: VersionBreakdownSeed | null = null
): number {
  let ratioTvlV2 = 1
  let ratioTvlV3 = 0
  let ratioVolV2 = 1
  let ratioVolV3 = 0
  let ratioFeeV2 = 1
  let ratioFeeV3 = 0
  let known = false

  if (seed) {
    const tvlSum = seed.v2.totalLiquidity + seed.v3.totalLiquidity
    const volSum = seed.v2.swapVolume24h + seed.v3.swapVolume24h
    const feeSum = seed.v2.swapFee24h + seed.v3.swapFee24h
    if (tvlSum > 0) {
      ratioTvlV2 = seed.v2.totalLiquidity / tvlSum
      ratioTvlV3 = seed.v3.totalLiquidity / tvlSum
      known = true
    }
    if (volSum > 0) {
      ratioVolV2 = seed.v2.swapVolume24h / volSum
      ratioVolV3 = seed.v3.swapVolume24h / volSum
      known = true
    }
    if (feeSum > 0) {
      ratioFeeV2 = seed.v2.swapFee24h / feeSum
      ratioFeeV3 = seed.v3.swapFee24h / feeSum
      known = true
    }
  }

  let filled = 0

  for (const p of points) {
    if (hasExplicitPair(p)) {
      const v2 = p.breakdowns!.V2!
      const v3 = p.breakdowns!.V3!
      const tvlSum = v2.totalLiquidity + v3.totalLiquidity
      const volSum = v2.swapVolume24h + v3.swapVolume24h
      const feeSum = v2.swapFee24h + v3.swapFee24h
      if (tvlSum > 0) {
        ratioTvlV2 = v2.totalLiquidity / tvlSum
        ratioTvlV3 = v3.totalLiquidity / tvlSum
        known = true
      }
      if (volSum > 0) {
        ratioVolV2 = v2.swapVolume24h / volSum
        ratioVolV3 = v3.swapVolume24h / volSum
        known = true
      }
      if (feeSum > 0) {
        ratioFeeV2 = v2.swapFee24h / feeSum
        ratioFeeV3 = v3.swapFee24h / feeSum
        known = true
      }
      continue
    }

    if (!known) continue

    const cowTvl = p.breakdowns?.COW_AMM?.totalLiquidity ?? 0
    const cowVol = p.breakdowns?.COW_AMM?.swapVolume24h ?? 0
    const cowFee = p.breakdowns?.COW_AMM?.swapFee24h ?? 0
    const nonCowTvl = Math.max(p.totalLiquidity - cowTvl, 0)
    const nonCowVol = Math.max(p.swapVolume24h - cowVol, 0)
    const nonCowFee = Math.max(p.swapFee24h - cowFee, 0)

    if (!p.breakdowns) p.breakdowns = {}
    p.breakdowns.V2 = emptyBreakdown({
      totalLiquidity: nonCowTvl * ratioTvlV2,
      swapVolume24h: nonCowVol * ratioVolV2,
      swapFee24h: nonCowFee * ratioFeeV2,
    })
    p.breakdowns.V3 = emptyBreakdown({
      totalLiquidity: nonCowTvl * ratioTvlV3,
      swapVolume24h: nonCowVol * ratioVolV3,
      swapFee24h: nonCowFee * ratioFeeV3,
    })
    filled++
  }

  return filled
}
