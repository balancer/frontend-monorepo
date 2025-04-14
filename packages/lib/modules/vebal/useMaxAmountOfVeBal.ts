import { useTokenBalances } from '../tokens/TokenBalancesProvider'
import { useTokens } from '../tokens/TokensProvider'
import { useVebalLockData } from './lock/VebalLockDataProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { expectedTotalVeBal } from './lock/VebalLockProvider'
import { useLockEndDate } from './lock/duration/useLockEndDate'
import { formatUnits } from 'viem'

export function useMaxAmountOfVeBAL() {
  const { vebalBptToken } = useTokens()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { mainnetLockedInfo: lockedInfo, isLoading: isLockInfoLoading } = useVebalLockData()
  const isLoading = isBalancesLoading || isLockInfoLoading

  const lockedBPTAmount = lockedInfo.hasExistingLock ? lockedInfo.lockedAmount : 0
  const bptAmount = vebalBptToken
    ? formatUnits(balanceFor(vebalBptToken.address)?.amount || 0n, 18)
    : '0'

  const bptTotalAmount = bn(lockedBPTAmount).plus(bn(bptAmount || 0n))

  const { maxLockEndDate } = useLockEndDate({
    lockedEndDate: lockedInfo.lockedEndDate ? new Date(lockedInfo.lockedEndDate) : undefined,
  })

  const maxAmount = expectedTotalVeBal({
    bpt: bptTotalAmount.toFixed(2),
    lockEndDate: maxLockEndDate,
  })

  function calculateCurrentVeBalPercentage(currentBalance: bigint): number {
    if (!maxAmount || maxAmount.isZero()) {
      return 0
    }

    const currentBalanceBN = bn(formatUnits(currentBalance, 18))

    const percentage = currentBalanceBN.div(maxAmount).toNumber() * 100

    return Math.min(percentage, 100)
  }

  return {
    isMaxAmountLoading: isLoading,
    maxAmount,
    calculateCurrentVeBalPercentage,
  }
}
