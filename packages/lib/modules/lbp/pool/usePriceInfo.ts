import { useQuery } from '@apollo/client'
import {
  GetLbpPriceInfoDocument,
  GqlChain,
  LbpPriceChartDataFragment,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  isAfter,
  isBefore,
  isSameHour,
  isWithinInterval,
  millisecondsToSeconds,
  secondsToMilliseconds,
  startOfHour,
} from 'date-fns'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { now } from '@repo/lib/shared/utils/time'

export type LbpPrice = {
  timestamp: Date
  projectTokenPrice: number
}

export type LbpSnapshot = {
  timestamp: Date
  projectTokenPrice: number
  reserveTokenPrice: number
  cumulativeVolume: number
  cumulativeFees: number
  tvl: number
  projectTokenBalance: number
  reserveTokenBalance: number
}

export type HourlyDataPoint = {
  timestamp: number
  tvl: number
  fees: number
  volume: number
}

export function usePriceInfo(chain: GqlChain, poolId: Address) {
  const apiResult = useQuery(GetLbpPriceInfoDocument, {
    variables: {
      poolId: poolId.toLowerCase(),
      chain,
      dataPoints: 5000,
    },
  })

  const snapshots = apiResult.data?.prices ? toLbpSnapshots(apiResult.data.prices) : []
  const hourlyData = apiResult.data?.prices ? aggregateToHourlyData(apiResult.data.prices) : []

  return {
    isLoading: apiResult.loading,
    snapshots,
    hourlyData,
  }
}

function toLbpSnapshots(apiPrices: LbpPriceChartDataFragment[]): LbpSnapshot[] {
  return apiPrices.map(price => ({
    timestamp: new Date(secondsToMilliseconds(price.timestamp)),
    projectTokenPrice: bn(price.projectTokenPrice)
      .times(price.reservePrice || 1) // reservePrice is 0 before the start so just use 1 then
      .toNumber(),
    reserveTokenPrice: price.reservePrice,
    cumulativeVolume: price.cumulativeVolume,
    cumulativeFees: price.cumulativeFees,
    tvl: price.tvl,
    projectTokenBalance: price.projectTokenBalance,
    reserveTokenBalance: price.reserveTokenBalance,
  }))
}

function aggregateToHourlyData(prices: LbpPriceChartDataFragment[]): HourlyDataPoint[] {
  const hourlyDataMap = new Map<number, HourlyDataPoint>()

  prices.forEach(price => {
    const timestamp = secondsToMilliseconds(parseInt(price.timestamp.toString()))
    const hourStart = millisecondsToSeconds(startOfHour(timestamp).getTime())
    const volume = parseFloat(price.volume?.toString() || '0')
    const fees = parseFloat(price.fees?.toString() || '0')
    const tvl = parseFloat(price.tvl?.toString() || '0')

    const existing = hourlyDataMap.get(hourStart)

    if (existing) {
      existing.volume += volume
      existing.fees += fees
      // Use the latest TVL for the hour
      existing.tvl = tvl
    } else {
      hourlyDataMap.set(hourStart, {
        timestamp: hourStart,
        volume,
        fees,
        tvl,
      })
    }
  })

  // Convert map to array and sort by timestamp
  return Array.from(hourlyDataMap.values()).sort((a, b) => a.timestamp - b.timestamp)
}

export function getCurrentPrice(snapshots: LbpSnapshot[]) {
  if (snapshots.length === 0) return 0

  const currentTime = now()
  if (isBefore(currentTime, snapshots[0].timestamp)) return snapshots[0].projectTokenPrice
  if (isAfter(currentTime, snapshots[snapshots.length - 1].timestamp)) {
    return snapshots[snapshots.length - 1].projectTokenPrice
  }

  for (let i = 0; i < snapshots.length; i++) {
    if (isSameHour(currentTime, snapshots[i].timestamp)) return snapshots[i].projectTokenPrice
    if (isSameHour(currentTime, snapshots[i + 1].timestamp))
      return snapshots[i + 1].projectTokenPrice
    if (
      isWithinInterval(currentTime, {
        start: snapshots[i].timestamp,
        end: snapshots[i + 1].timestamp,
      })
    ) {
      return bn(snapshots[i].projectTokenPrice)
        .plus(snapshots[i + 1].projectTokenPrice)
        .div(2)
        .toNumber()
    }
  }

  throw new Error('Unreachable code')
}

export function min(prices: LbpPrice[]) {
  return Math.min(...prices.map(point => point.projectTokenPrice))
}

export function max(prices: LbpPrice[]) {
  return Math.max(...prices.map(point => point.projectTokenPrice))
}
