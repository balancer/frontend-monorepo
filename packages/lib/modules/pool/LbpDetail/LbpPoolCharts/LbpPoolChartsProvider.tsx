import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { usePool } from '../../PoolProvider'
import { getCurrentPrice, usePriceInfo } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import {
  secondsToMilliseconds,
  isAfter,
  isBefore,
  differenceInDays,
  differenceInHours,
} from 'date-fns'

type LbpPoolChartsContextType = ReturnType<typeof useLbpPoolChartsLogic>

const LbpPoolChartsContext = createContext<LbpPoolChartsContextType | null>(null)

export function useLbpPoolChartsLogic() {
  const { pool } = usePool()

  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
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
  const hasSnapshots = snapshots.length > 0
  const hasHourlyData = hourlyData.length > 0

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
