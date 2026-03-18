import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { usePool } from '../../PoolProvider'
import {
  getCurrentPrice,
  getCurrentReserveTokenBalance,
  usePriceInfo,
} from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { Address } from 'viem'
import {
  secondsToMilliseconds,
  isAfter,
  isBefore,
  differenceInDays,
  differenceInHours,
} from 'date-fns'
import { LbpV3 } from '@repo/lib/modules/pool/pool.types'
import { bn } from '@repo/lib/shared/utils/numbers'

type LbpPoolChartsContextType = ReturnType<typeof useLbpPoolChartsLogic>

const LbpPoolChartsContext = createContext<LbpPoolChartsContextType | null>(null)

export function useLbpPoolChartsLogic() {
  const { pool } = usePool()

  const lbpPool = pool as LbpV3
  const startDateTime = new Date(secondsToMilliseconds(lbpPool.startTime))
  const endDateTime = new Date(secondsToMilliseconds(lbpPool.endTime))
  const now = new Date()
  const isSaleOngoing = isAfter(now, startDateTime) && isBefore(now, endDateTime)
  const daysDiff = differenceInDays(endDateTime, isSaleOngoing ? now : startDateTime)
  const hoursDiff =
    differenceInHours(endDateTime, isSaleOngoing ? now : startDateTime) - daysDiff * 24
  const salePeriodText = isSaleOngoing
    ? `Sale: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} remaining`
    : `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`

  const { snapshots, hourlyData, isLoading } = usePriceInfo(pool.chain, pool.id as Address)

  const currentPrice = getCurrentPrice(snapshots)
  const currentSnapshot = snapshots[snapshots.length - 1]
  const hasSnapshots = snapshots.length > 0
  const hasHourlyData = hourlyData.length > 0

  const reserveTokenSymbol =
    lbpPool.poolTokens.find(
      token => token.address.toLowerCase() === lbpPool.reserveToken.toLowerCase()
    )?.symbol || 'Reserve'

  const currentFundsRaised = getCurrentReserveTokenBalance(snapshots)

  const currentFundsRaisedUsd = bn(currentFundsRaised)
    .times(currentSnapshot?.reserveTokenPrice || 0)
    .toNumber()
  const projectToken = lbpPool.poolTokens[lbpPool.projectTokenIndex]
  const fundsRaisedGoal =
    projectToken?.balance && lbpPool.projectTokenRate
      ? bn(projectToken.balance).times(lbpPool.projectTokenRate).toNumber()
      : null
  const currentFundsRaisedPercentage =
    fundsRaisedGoal && fundsRaisedGoal > 0
      ? bn(currentFundsRaised).div(fundsRaisedGoal).times(100).toNumber()
      : null

  function formatFundsRaisedPercentage(value: number) {
    return bn(value).toFixed(1)
  }

  return {
    salePeriodText,
    snapshots,
    hourlyData: hourlyData || [],
    isLoading,
    startDateTime,
    endDateTime,
    now,
    isSaleOngoing,
    daysDiff,
    hoursDiff,
    currentPrice,
    currentFundsRaised,
    currentFundsRaisedUsd,
    fundsRaisedGoal,
    currentFundsRaisedPercentage,
    formatFundsRaisedPercentage,
    reserveTokenSymbol,
    hasSnapshots,
    hasHourlyData,
  }
}

export function LbpPoolChartsProvider({ children }: PropsWithChildren) {
  const hook = useLbpPoolChartsLogic()
  return <LbpPoolChartsContext.Provider value={hook}>{children}</LbpPoolChartsContext.Provider>
}

export const useLbpPoolCharts = (): LbpPoolChartsContextType =>
  useMandatoryContext(LbpPoolChartsContext, 'LbpPoolCharts')
