import { useQuery } from '@tanstack/react-query'
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns'
import { useReliquary } from '../ReliquaryProvider'
import { useGetLevelInfo } from './useGetLevelInfo'
import { useGetLevelOnUpdate } from './useGetLevelOnUpdate'
import { useGetPositionForId } from './useGetPositionForId'

const MAX_MATURITY = 6048000 // 10 weeks in seconds

export function useReliquaryDepositImpact(amount: number, relicId?: string) {
  const { chain } = useReliquary()
  const { position, isLoading: isLoadingPosition } = useGetPositionForId(relicId || '', chain)

  const { levelOnUpdate, isLoading: isLoadingLevelOnUpdate } = useGetLevelOnUpdate(
    relicId || '',
    chain
  )

  const { maturityThresholds, isLoading: isLoadingLevelInfo } = useGetLevelInfo(
    position?.farmId ?? '',
    chain
  )

  const isReady =
    !Number.isNaN(amount) &&
    !!relicId &&
    !!position &&
    maturityThresholds.length > 0 &&
    levelOnUpdate !== undefined

  const depositImpactQuery = useQuery({
    queryKey: [
      'relicDepositImpact',
      relicId,
      amount,
      position?.entry,
      levelOnUpdate,
      maturityThresholds.join(','),
    ],
    queryFn: () => {
      if (!isReady || !position) {
        return
      }

      const maturityLevels = maturityThresholds.map(maturity => BigInt(maturity))
      const weight = amount / (amount + parseFloat(position.amount))
      const nowTimestamp = Math.floor(millisecondsToSeconds(Date.now()))
      const maturity = nowTimestamp - position.entry
      const entryTimestampAfterDeposit = Math.round(position.entry + maturity * weight)
      const newMaturity = nowTimestamp - entryTimestampAfterDeposit
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
        newLevel >= maxLevel
          ? 'max level reached'
          : `${newMaturity}/${maturityLevels[newLevel + 1]}`

      const depositImpactTimeInMilliseconds = secondsToMilliseconds(MAX_MATURITY - newMaturity)
      const staysMax = levelOnUpdate === maxLevel && newLevel === maxLevel

      return {
        oldMaturity: maturity,
        newMaturity,
        oldLevel: levelOnUpdate,
        newLevel,
        oldLevelProgress,
        newLevelProgress,
        depositImpactTimeInMilliseconds,
        staysMax,
      }
    },
    enabled: isReady,
  })

  return {
    ...depositImpactQuery,
    isLoading:
      isLoadingPosition ||
      isLoadingLevelOnUpdate ||
      isLoadingLevelInfo ||
      depositImpactQuery.isLoading,
  }
}
