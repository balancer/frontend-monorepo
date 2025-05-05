import { useMemo } from 'react'
import { useVebalUserData } from '../useVebalUserData'
import { formatUnits } from 'viem'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { format } from 'date-fns'
import BigNumber from 'bignumber.js'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'

export type VebalUserStatsValues = {
  balance: bigint
  rank: number
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
  lockExpired: boolean | undefined
}

export function useVebalUserStats() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo: lockedInfo, isLoading: lockedInfoIsLoading } = useVebalLockData()
  const { isLoading: userDataIsLoading, veBALBalance, rank } = useVebalUserData()

  const userStats: VebalUserStatsValues | undefined = useMemo(() => {
    if (isConnected) {
      const percentOfAllSupply = bn(formatUnits(veBALBalance, 18)).div(lockedInfo.totalSupply || 0)

      const lockedUntil = lockedInfo.lockedEndDate
        ? format(lockedInfo.lockedEndDate, 'yyyy-MM-dd')
        : undefined

      const lockExpired = lockedInfo.isExpired === undefined || lockedInfo.isExpired === true

      return {
        balance: veBALBalance,
        rank: rank || 0,
        percentOfAllSupply,
        lockedUntil,
        lockExpired,
      }
    }
  }, [lockedInfo, isConnected, veBALBalance, rank])

  return {
    userStats,
    userDataIsLoading,
    lockedInfoIsLoading,
  }
}

export function formatUserVebal(userStats?: VebalUserStatsValues) {
  return userStats && !userStats.lockExpired ? fNum('token', formatUnits(userStats.balance, 18)) : 0
}
