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

  const prices = apiResult.data?.prices ? toLbpPrices(apiResult.data.prices) : []
  const hourlyData = apiResult.data?.prices ? aggregateToHourlyData(apiResult.data.prices) : []

  return {
    isLoading: apiResult.loading,
    prices,
    hourlyData,
  }
}

function toLbpPrices(apiPrices: LbpPriceChartDataFragment[]): LbpPrice[] {
  return apiPrices.map(price => {
    return {
      timestamp: new Date(secondsToMilliseconds(price.timestamp)),
      projectTokenPrice: bn(price.projectTokenPrice).times(price.reservePrice).toNumber(),
    }
  })
}

function aggregateToHourlyData(prices: LbpPriceChartDataFragment[]): HourlyDataPoint[] {
  const hourlyDataMap = new Map<number, HourlyDataPoint>()

  prices.forEach(price => {
    const timestamp = secondsToMilliseconds(parseInt(price.timestamp.toString()))
    const hourStart = startOfHour(timestamp).getTime()
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

export function getCurrentPrice(prices: LbpPrice[]) {
  if (prices.length === 0) return 0

  const currentTime = now()
  if (isBefore(currentTime, prices[0].timestamp)) return prices[0].projectTokenPrice
  if (isAfter(currentTime, prices[prices.length - 1].timestamp)) {
    return prices[prices.length - 1].projectTokenPrice
  }

  for (let i = 0; i < prices.length; i++) {
    if (isSameHour(currentTime, prices[i].timestamp)) return prices[i].projectTokenPrice
    if (isSameHour(currentTime, prices[i + 1].timestamp)) return prices[i + 1].projectTokenPrice
    if (
      isWithinInterval(currentTime, { start: prices[i].timestamp, end: prices[i + 1].timestamp })
    ) {
      return bn(prices[i].projectTokenPrice)
        .plus(prices[i + 1].projectTokenPrice)
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
