'use client'

import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { useDebounce } from 'use-debounce'
import { Address } from 'viem'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { HumanAmount } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { sentryMetaForRemoveLiquidityHandler } from '@/lib/shared/utils/query-errors'

type Params = {
  handler: RemoveLiquidityHandler
  poolId: string
  humanBptIn: HumanAmount
  tokenOut: Address
  enabled?: boolean
}

export function useRemoveLiquidityPriceImpactQuery({
  handler,
  poolId,
  humanBptIn,
  tokenOut,
  enabled = true,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
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
    meta: sentryMetaForRemoveLiquidityHandler(
      'Error in remove liquidity price impact query',
      params
    ),
    ...onlyExplicitRefetch,
  })
}
