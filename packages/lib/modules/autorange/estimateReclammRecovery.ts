import { calculateLowerMargin, calculateUpperMargin } from './autoRangeMath'

const WAD = 10n ** 18n
const SECONDS_PER_DAY = 86400

export type ReclammRecoveryInput = {
  balanceA: bigint
  balanceB: bigint
  virtualBalanceA: bigint
  virtualBalanceB: bigint
  /** On-chain centeredness margin (1e18-scaled fraction, e.g. 5% → 5e16). */
  centerednessMargin: bigint
  /** On-chain daily shift exponent (1e18-scaled fraction). 100% = 2x/0.5x per day. */
  dailyPriceShiftExponent: bigint
  /** External market price in the same orientation as the chart: token B per token A. */
  marketPrice: number | null
}

export type ReclammRecoveryEstimate = {
  /** Seconds until the target band reaches market price; `0` if already in range. */
  secondsToInRange: number | null
}

type SimState = {
  virtualBalanceA: bigint
  virtualBalanceB: bigint
}

function descale(value: bigint): number {
  return Number(value) / Number(WAD)
}

function marginPercent(centerednessMargin: bigint): number {
  // Matches analytics AutoRange panel: margin param is percent units (5 for 5%).
  return Number(centerednessMargin) / 1e16
}

function getTargetBand(
  input: ReclammRecoveryInput,
  state: SimState
): { lowTarget: number; highTarget: number } | null {
  const balanceA = descale(input.balanceA)
  const balanceB = descale(input.balanceB)
  const virtualBalanceA = descale(state.virtualBalanceA)
  const virtualBalanceB = descale(state.virtualBalanceB)
  const margin = marginPercent(input.centerednessMargin)

  if (
    !Number.isFinite(balanceA) ||
    !Number.isFinite(balanceB) ||
    !Number.isFinite(virtualBalanceA) ||
    !Number.isFinite(virtualBalanceB) ||
    virtualBalanceA <= 0 ||
    virtualBalanceB <= 0 ||
    margin <= 0
  ) {
    return null
  }

  const invariant = (balanceA + virtualBalanceA) * (balanceB + virtualBalanceB)
  const lowerMarginBal = calculateLowerMargin({
    margin,
    invariant,
    virtualBalanceA,
    virtualBalanceB,
  })
  const upperMarginBal = calculateUpperMargin({
    margin,
    invariant,
    virtualBalanceA,
    virtualBalanceB,
  })
  if (!Number.isFinite(lowerMarginBal) || !Number.isFinite(upperMarginBal)) return null

  return {
    highTarget: invariant / (lowerMarginBal * lowerMarginBal),
    lowTarget: invariant / (upperMarginBal * upperMarginBal),
  }
}

function projectSecondsToInRange(input: ReclammRecoveryInput): number | null {
  const state = {
    virtualBalanceA: input.virtualBalanceA,
    virtualBalanceB: input.virtualBalanceB,
  }
  const band = getTargetBand(input, state)
  const referencePrice = input.marketPrice
  const dailyShiftExponent = Number(input.dailyPriceShiftExponent) / Number(WAD)
  if (
    !band ||
    referencePrice === null ||
    !Number.isFinite(referencePrice) ||
    referencePrice <= 0 ||
    !Number.isFinite(dailyShiftExponent) ||
    dailyShiftExponent <= 0
  ) {
    return null
  }

  if (referencePrice >= band.lowTarget && referencePrice <= band.highTarget) return 0

  const distanceRatio =
    referencePrice > band.highTarget
      ? referencePrice / band.highTarget
      : band.lowTarget / referencePrice

  if (!Number.isFinite(distanceRatio) || distanceRatio <= 1) return 0

  const days = Math.log2(distanceRatio) / dailyShiftExponent
  if (!Number.isFinite(days) || days < 0) return null

  return days * SECONDS_PER_DAY
}

/**
 * Projects how long an out-of-center AutoRange pool needs to re-enter its
 * target band, assuming no further swaps and a stable external market price.
 * A daily shift exponent of 100% means the price range doubles or halves once
 * per day, so the horizon is computed in price space against market price.
 */
export function estimateReclammRecovery(input: ReclammRecoveryInput): ReclammRecoveryEstimate {
  return {
    secondsToInRange: projectSecondsToInRange(input),
  }
}

/** Maps analytics `ReclammTypeState` (on-chain strings) to projection input. */
export function reclammTypeStateToRecoveryInput(
  rc: {
    liveBalanceA: string
    liveBalanceB: string
    virtualBalanceA: string
    virtualBalanceB: string
    centerednessMargin: string
    dailyPriceShiftExponent: string
  },
  marketPrice: number | null
): ReclammRecoveryInput {
  return {
    balanceA: BigInt(rc.liveBalanceA),
    balanceB: BigInt(rc.liveBalanceB),
    virtualBalanceA: BigInt(rc.virtualBalanceA),
    virtualBalanceB: BigInt(rc.virtualBalanceB),
    centerednessMargin: BigInt(rc.centerednessMargin),
    dailyPriceShiftExponent: BigInt(rc.dailyPriceShiftExponent),
    marketPrice,
  }
}

export function formatRecoveryDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  if (seconds <= 0) return 'now'
  if (seconds < 120) return `~${Math.max(1, Math.round(seconds))} s`
  if (seconds < 3600) return `~${Math.round(seconds / 60)} min`
  if (seconds < 86400) {
    const hours = seconds / 3600
    return hours < 10 ? `~${hours.toFixed(1).replace(/\.0$/, '')} hr` : `~${Math.round(hours)} hr`
  }
  const days = seconds / 86400
  if (days < 60) return `~${Math.round(days)} days`
  if (days < 365) return `~${Math.round(days / 30)} mo`
  return `~${(days / 365).toFixed(1).replace(/\.0$/, '')} yr`
}
