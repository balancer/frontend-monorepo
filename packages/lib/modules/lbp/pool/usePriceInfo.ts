import { useQuery } from '@apollo/client'
import {
  GetLbpPriceInfoDocument,
  GqlChain,
  LbpPriceChartData,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isAfter, isBefore, isSameHour, isWithinInterval, secondsToMilliseconds } from 'date-fns'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address } from 'viem'
import { now } from '@repo/lib/shared/utils/time'

export type LbpPrice = {
  timestamp: Date
  projectTokenPrice: number
}

export function usePriceInfo(chain: GqlChain, poolId: Address) {
  const apiResult = useQuery(GetLbpPriceInfoDocument, {
    variables: {
      poolId: poolId.toLowerCase(),
      chain,
    },
  })

  const prices = apiResult.data?.prices ? toLbpPrices(apiResult.data.prices) : []

  return {
    isLoading: apiResult.loading,
    prices,
  }
}

function toLbpPrices(apiPrices: LbpPriceChartData[]): LbpPrice[] {
  return apiPrices.map(price => {
    return {
      timestamp: new Date(secondsToMilliseconds(price.timestamp)),
      projectTokenPrice: bn(price.projectTokenPrice).times(price.reservePrice).toNumber(),
    }
  })
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
