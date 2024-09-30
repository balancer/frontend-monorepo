'use client'

import { useDebounce } from 'use-debounce'
import { Address } from 'viem'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { HumanAmount } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { useBlockNumber } from 'wagmi'
import { defaultDebounceMs, onlyExplicitRefetch } from '../../../../../shared/utils/queries'
import { sentryMetaForRemoveLiquidityHandler } from '../../../../../shared/utils/query-errors'
import { useUserSettings } from '../../../../user/settings/UserSettingsProvider'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

type Params = {
  handler: RemoveLiquidityHandler
  poolId: string
  chainId: number
  humanBptIn: HumanAmount
  tokenOut: Address
  enabled?: boolean
}

export function useRemoveLiquidityPriceImpactQuery({
  handler,
  poolId,
  chainId,
  humanBptIn,
  tokenOut,
  enabled = true,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const debouncedBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId,
    humanBptIn: humanBptIn,
    tokenOut,
  }

  const queryKey = removeLiquidityKeys.priceImpact(params)

  const queryFn = async () =>
    handler.getPriceImpact({
      humanBptIn: debouncedBptIn,
      tokenOut,
    })

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && Number(debouncedBptIn) > 0,
    gcTime: 0,
    meta: sentryMetaForRemoveLiquidityHandler('Error in remove liquidity price impact query', {
      ...params,
      chainId,
      blockNumber,
    }),
    ...onlyExplicitRefetch,
  })
}