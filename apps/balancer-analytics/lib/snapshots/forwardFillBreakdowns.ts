/**
 * Forward-fill V2/V3 protocol breakdowns onto snapshot points that only have
 * CORE (+ optional COW_AMM).
 *
 * Why this exists:
 *   The hourly api-v3 cron writes CORE + COW_AMM only — it cannot emit a clean
 *   V2/V3 split (BPT double-count). Explicit V2/V3 rows come from the DefiLlama
 *   backfill. When that backfill lags (or a chart window simply doesn't reach
 *   the last DefiLlama day), charts would otherwise default the stack to 100%
 *   v2 / 0% v3 and Balancer v3 would silently disappear.
 *
 * Strategy:
 *   Walk points ascending. Whenever an explicit V2+V3 pair is present, remember
 *   its TVL/volume/fees share. For subsequent points missing that pair, attribute
 *   `(CORE − COW)` using the last known share so the stacked total still
 *   matches the api-v3 headline.
 *
 *   Callers that have no in-window seed should pass `seed` from the most recent
 *   V2/V3 ALL-chain rows in Postgres (see `/api/snapshots`).
 */

import type {
  ProtocolBreakdown,
  ProtocolSnapshotPoint,
  VersionBreakdownSeed,
  VersionMetricSlice,
} from './types'

type VersionShare = { v2: number; v3: number }

type VersionRatios = {
  tvl: VersionShare
  volume: VersionShare
  fees: VersionShare
  known: boolean
}

function emptyRatios(): VersionRatios {
  return {
    tvl: { v2: 1, v3: 0 },
    volume: { v2: 1, v3: 0 },
    fees: { v2: 1, v3: 0 },
    known: false,
  }
}

function share(a: number, b: number): VersionShare | null {
  const sum = a + b
  if (sum <= 0) return null
  return { v2: a / sum, v3: b / sum }
}

function applyPair(ratios: VersionRatios, v2: VersionMetricSlice, v3: VersionMetricSlice): void {
  const tvl = share(v2.totalLiquidity, v3.totalLiquidity)

  if (tvl) {
    ratios.tvl = tvl
    ratios.known = true
  }

  const volume = share(v2.swapVolume24h, v3.swapVolume24h)

  if (volume) {
    ratios.volume = volume
    ratios.known = true
  }

  const fees = share(v2.swapFee24h, v3.swapFee24h)

  if (fees) {
    ratios.fees = fees
    ratios.known = true
  }
}

function emptyBreakdown(partial: VersionMetricSlice): ProtocolBreakdown {
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
  const ratios = emptyRatios()
  if (seed) applyPair(ratios, seed.v2, seed.v3)

  let filled = 0

  for (const p of points) {
    if (hasExplicitPair(p)) {
      applyPair(ratios, p.breakdowns!.V2!, p.breakdowns!.V3!)
      continue
    }

    if (!ratios.known) continue

    const cowTvl = p.breakdowns?.COW_AMM?.totalLiquidity ?? 0
    const cowVol = p.breakdowns?.COW_AMM?.swapVolume24h ?? 0
    const cowFee = p.breakdowns?.COW_AMM?.swapFee24h ?? 0
    const nonCowTvl = Math.max(p.totalLiquidity - cowTvl, 0)
    const nonCowVol = Math.max(p.swapVolume24h - cowVol, 0)
    const nonCowFee = Math.max(p.swapFee24h - cowFee, 0)

    if (!p.breakdowns) p.breakdowns = {}

    p.breakdowns.V2 = emptyBreakdown({
      totalLiquidity: nonCowTvl * ratios.tvl.v2,
      swapVolume24h: nonCowVol * ratios.volume.v2,
      swapFee24h: nonCowFee * ratios.fees.v2,
    })

    p.breakdowns.V3 = emptyBreakdown({
      totalLiquidity: nonCowTvl * ratios.tvl.v3,
      swapVolume24h: nonCowVol * ratios.volume.v3,
      swapFee24h: nonCowFee * ratios.fees.v3,
    })

    filled++
  }

  return filled
}
