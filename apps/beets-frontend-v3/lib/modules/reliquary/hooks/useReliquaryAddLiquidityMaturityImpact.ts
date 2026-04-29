import { useQuery } from '@tanstack/react-query'
import { useReliquary } from '../ReliquaryProvider'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'
import { useGetLevelInfo } from './useGetLevelInfo'
import { useGetLevelOnUpdate } from './useGetLevelOnUpdate'
import { useGetPositionForId } from './useGetPositionForId'
import { calculateMaturityImpact } from '../utils/maturity-impact'

export function useReliquaryAddLiquidityMaturityImpact(amount: Numberish, relicId?: string) {
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
    bn(amount).gt(0) &&
    !!relicId &&
    !!position &&
    maturityThresholds.length > 0 &&
    levelOnUpdate !== undefined

  const addLiquidityMaturityImpactQuery = useQuery({
    queryKey: [
      'relicAddLiquidityMaturityImpact',
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

      return calculateMaturityImpact({
        amount,
        positionAmount: position.amount,
        positionEntry: position.entry,
        levelOnUpdate,
        maturityThresholds,
      })
    },
    enabled: isReady,
  })

  return {
    ...addLiquidityMaturityImpactQuery,
    isLoading:
      isLoadingPosition ||
      isLoadingLevelOnUpdate ||
      isLoadingLevelInfo ||
      addLiquidityMaturityImpactQuery.isLoading,
  }
}
