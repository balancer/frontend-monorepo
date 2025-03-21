'use client'

import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useDebounce } from 'use-debounce'
import { Address } from 'viem'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { HumanAmount } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { sentryMetaForRemoveLiquidityHandler } from '@repo/lib/shared/utils/query-errors'
import { useBlockNumber } from 'wagmi'
import { usePool } from '../../../PoolProvider'
import { hasStableSurgeHook } from '../../../pool.helpers'

type Params = {
  handler: RemoveLiquidityHandler
  chainId: number
  humanBptIn: HumanAmount
  tokenOut: Address
  enabled?: boolean
}

export function useRemoveLiquidityPriceImpactQuery({
  handler,
  chainId,
  humanBptIn,
  tokenOut,
  enabled = true,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { pool } = usePool()
  const { slippage } = useUserSettings()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const debouncedBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    humanBptIn: debouncedBptIn,
    tokenOut,
  }

  const queryKey = removeLiquidityKeys.priceImpact(params)

  const queryFn = async () =>
    handler.getPriceImpact({
      humanBptIn: debouncedBptIn,
      tokenOut,
      userAddress,
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
      hasStableSurgeHook: hasStableSurgeHook(pool),
    }),
    ...onlyExplicitRefetch,
  })
}
