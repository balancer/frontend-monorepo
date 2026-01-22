import { addSeconds, fromUnixTime } from 'date-fns'
import { ReliquaryFarmPosition } from '../ReliquaryProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReliquaryPosition } from '../reliquary.types'

export function relicGetMaturityProgress(
  relic: ReliquaryFarmPosition | ReliquaryPosition | null,
  maturities: string[]
) {
  if (!relic || !maturities.length) {
    return {
      canUpgrade: false,
      canUpgradeTo: -1,
      progressToNextLevel: 0,
      isMaxMaturity: false,
      entryDate: new Date(),
      levelUpDate: new Date(),
    }
  }

  const weekInSeconds = 60 * 60 * 24 * 7
  const relicMaturityStart = relic.entry
  const timeElapsedSinceStart = Date.now() / 1000 - relicMaturityStart

  // reverse the maturities because otherwise findIndex will always be 0
  const maturitiesReversed = [...maturities]
  maturitiesReversed.reverse()

  const nextLevelMaturityIndex =
    maturities.length -
    1 -
    maturitiesReversed.findIndex(maturity => bn(timeElapsedSinceStart).gte(bn(maturity)))

  const isMaxMaturity = bn(timeElapsedSinceStart).gt(bn(maturities[maturities.length - 1]))
  const canUpgradeTo = isMaxMaturity ? maturities.length : nextLevelMaturityIndex + 1

  const canUpgrade =
    (isMaxMaturity && relic.level < maturities.length - 1) ||
    (nextLevelMaturityIndex > 0 && nextLevelMaturityIndex > relic.level)

  const currentLevelMaturity = bn(maturities[relic.level]).toNumber()
  const timeElapsedSinceCurrentLevel = Date.now() / 1000 - (currentLevelMaturity + relic.entry)

  const timeBetweenEntryAndNextLevel = isMaxMaturity
    ? 3600
    : bn(maturities[relic.level + 1]).toNumber()

  const progressToNextLevel = canUpgrade
    ? 100
    : (timeElapsedSinceCurrentLevel / weekInSeconds) * 100

  const entryDate = fromUnixTime(relicMaturityStart)
  const levelUpDate = addSeconds(entryDate, timeBetweenEntryAndNextLevel)

  return {
    canUpgrade,
    canUpgradeTo,
    progressToNextLevel,
    isMaxMaturity,
    entryDate,
    levelUpDate,
  }
}
