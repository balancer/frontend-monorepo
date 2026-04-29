import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'

const MAX_MATURITY = 6048000 // 10 weeks in seconds

export type MaturityImpactInput = {
  amount: Numberish
  positionAmount: string
  positionEntry: number
  levelOnUpdate: number
  maturityThresholds: string[]
  nowTimestamp?: number // allow injection for testing; defaults to Date.now()
}

export type MaturityImpactResult = {
  oldMaturity: number
  newMaturity: number
  oldLevel: number
  newLevel: number
  oldLevelProgress: string
  newLevelProgress: string
  addLiquidityMaturityImpactTimeInMilliseconds: number
  staysMax: boolean
}

export function calculateMaturityImpact(input: MaturityImpactInput): MaturityImpactResult {
  const {
    amount,
    positionAmount,
    positionEntry,
    levelOnUpdate,
    maturityThresholds,
    nowTimestamp: nowOverride,
  } = input

  const maturityLevels = maturityThresholds.map(maturity => BigInt(maturity))
  const weight = bn(amount).div(bn(amount).plus(positionAmount)).toNumber()
  const nowTimestamp = nowOverride ?? Math.floor(millisecondsToSeconds(Date.now()))
  const maturity = nowTimestamp - positionEntry
  const entryTimestampAfterAddLiquidity = Math.round(positionEntry + maturity * weight)
  const newMaturity = nowTimestamp - entryTimestampAfterAddLiquidity
  const maxLevel = maturityLevels.length - 1

  let newLevel = 0
  maturityLevels.forEach((level, i) => {
    if (newMaturity >= Number(level)) {
      newLevel = i
    }
  })

  const oldLevelProgress =
    levelOnUpdate >= maxLevel
      ? 'max level reached'
      : `${maturity}/${maturityLevels[levelOnUpdate + 1]}`

  const newLevelProgress =
    newLevel >= maxLevel ? 'max level reached' : `${newMaturity}/${maturityLevels[newLevel + 1]}`

  const remainingSeconds = Math.max(0, MAX_MATURITY - newMaturity)
  const addLiquidityMaturityImpactTimeInMilliseconds = secondsToMilliseconds(remainingSeconds)
  const staysMax = levelOnUpdate === maxLevel && newLevel === maxLevel

  return {
    oldMaturity: maturity,
    newMaturity,
    oldLevel: levelOnUpdate,
    newLevel,
    oldLevelProgress,
    newLevelProgress,
    addLiquidityMaturityImpactTimeInMilliseconds,
    staysMax,
  }
}
