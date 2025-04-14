'use client'

import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { HumanAmount } from '@balancer/sdk'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { sentryMetaForRemoveLiquidityHandler } from '@repo/lib/shared/utils/query-errors'
import { Address } from 'viem'
import { hasStableSurgeHook } from '../../../pool.helpers'
import { usePool } from '../../../PoolProvider'

export type RemoveLiquiditySimulationQueryResult = ReturnType<
  typeof useRemoveLiquiditySimulationQuery
>

type Params = {
  handler: RemoveLiquidityHandler
  chainId: number
  humanBptIn: HumanAmount
  tokenOut: Address // used by single removes
  tokensOut?: Address[] // used by boosted proportional removes
  enabled?: boolean
}

export function useRemoveLiquiditySimulationQuery({
  handler,
  chainId,
  humanBptIn,
  tokenOut,
  tokensOut,
  enabled = true,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { pool } = usePool()
  const { slippage } = useUserSettings()
  const debouncedHumanBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    humanBptIn: debouncedHumanBptIn,
    tokenOut,
    tokensOut,
  }
  const queryKey = removeLiquidityKeys.preview(params)

  const queryFn = async () =>
    handler.simulate({
      humanBptIn: debouncedHumanBptIn,
      tokenOut,
      tokensOut,
      userAddress,
    })

  const result = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && Number(debouncedHumanBptIn) > 0,
    gcTime: 0,
    meta: sentryMetaForRemoveLiquidityHandler('Error in remove liquidity simulation query', {
      ...params,
      chainId,
      hasStableSurgeHook: hasStableSurgeHook(pool),
    }),
    ...onlyExplicitRefetch,
  })
  return result
}
