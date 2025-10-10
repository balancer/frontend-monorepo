'use client'

import { useQuery } from '@tanstack/react-query'
import { mins } from '@repo/lib/shared/utils/time'
import { bn } from '@repo/lib/shared/utils/numbers'
import { FlyQuoteApiRequest, FlyQuoteApiResponse } from '@/app/api/fly/quote/route'
import { useLoopsGetCollateralAndDebtForShares } from '@/lib/modules/loops/hooks/useLoopsGetCollateralAndDebtForShares'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useLoopsGetFlyQuote(amountShares: string, chain: GqlChain) {
  const { collateralInLst, debtInEth } = useLoopsGetCollateralAndDebtForShares(amountShares, chain)

  const networkConfig = getNetworkConfig(chain)

  const params: FlyQuoteApiRequest = {
    fromTokenAddress: networkConfig.tokens.stakedAsset?.address || '',
    toTokenAddress: networkConfig.tokens.addresses.wNativeAsset || '',
    sellAmount: collateralInLst.toString(),
    slippage: '0.005',
    fromAddress: networkConfig.contracts.beets?.magpieLoopedSonicRouter || '',
    toAddress: networkConfig.contracts.beets?.magpieLoopedSonicRouter || '',
    gasless: 'false',
    network: 'sonic',
  }

  const queryKey = ['fly-quote', params] as const

  const queryFn = async () => {
    const searchParams = new URLSearchParams(Object.entries(params) as [string, string][])
    const url = `/api/fly/quote?${searchParams.toString()}`
    const res = await fetch(url)

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch quote')
    }

    return (await res.json()) as FlyQuoteApiResponse
  }

  const { data, isLoading, error, refetch } = useQuery<FlyQuoteApiResponse>({
    queryKey,
    queryFn,
    enabled: bn(params.sellAmount).gt(0),
    staleTime: mins(1).toMs(),
  })

  const debtMinusFees = bn(debtInEth).minus(bn(0.0005).times(debtInEth))

  const wethAmountOut = data?.amountOut
    ? BigInt(
        bn(data?.amountOut || '0')
          .minus(debtMinusFees)
          .toFixed(0)
      )
    : 0n

  const minWethAmountOut = data?.typedData.message.amountOutMin
    ? BigInt(
        bn(data?.typedData.message.amountOutMin || '0')
          .minus(debtMinusFees)
          .toFixed(0)
      )
    : 0n

  return { data, isLoading, error, refetch, minWethAmountOut, wethAmountOut }
}
