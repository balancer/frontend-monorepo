import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPositionForId } from './useGetPositionForId'
import { useGetLevelOnUpdate } from './useGetLevelOnUpdate'
import { useGetLevelInfo } from './useGetLevelInfo'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'

const MAX_LEVEL = 10

export function useGetDepositImpact(chain: GqlChain, amount: string, relicId: string) {
  const { position } = useGetPositionForId(chain, relicId)
  const { levelOnUpdate } = useGetLevelOnUpdate(chain, relicId)
  const { maturityThresholds } = useGetLevelInfo(chain, position?.poolId)

  const weight = Number(bn(amount).div(bn(amount).plus(formatUnits(position.amount || 0n, 18))))

  const nowTimestamp = Math.floor(Date.now() / 1000)
  const maturity = nowTimestamp - position.entry
  const entryTimestampAfterDeposit = Math.round(position.entry + maturity * weight)
  const newMaturity = nowTimestamp - entryTimestampAfterDeposit

  let newLevel = 0
  maturityThresholds?.forEach((level, i) => {
    if (newMaturity >= Number(level)) {
      newLevel = i
    }
  })

  const oldLevelProgress =
    levelOnUpdate >= (maturityThresholds || []).length - 1
      ? 'max level reached'
      : `${maturity}/${maturityThresholds?.[levelOnUpdate + 1]}`
  const newLevelProgress =
    newLevel > (maturityThresholds || []).length
      ? 'max level reached'
      : `${newMaturity}/${maturityThresholds?.[newLevel + 1]}`

  const depositImpactTimeInMilliseconds = (maturity - newMaturity) * 1000

  const staysMax = levelOnUpdate === MAX_LEVEL && newLevel === MAX_LEVEL

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
}
