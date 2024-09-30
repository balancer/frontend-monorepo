'use client'

import { HumanAmount } from '@balancer/sdk'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { Address } from 'viem'
import { defaultDebounceMs, onlyExplicitRefetch } from '../../../../../shared/utils/queries'
import { sentryMetaForRemoveLiquidityHandler } from '../../../../../shared/utils/query-errors'
import { useUserSettings } from '../../../../user/settings/UserSettingsProvider'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

export type RemoveLiquiditySimulationQueryResult = ReturnType<
  typeof useRemoveLiquiditySimulationQuery
>

type Params = {
  handler: RemoveLiquidityHandler
  poolId: string
  chainId: number
  humanBptIn: HumanAmount
  tokenOut: Address
  enabled?: boolean
}

export function useRemoveLiquiditySimulationQuery({
  handler,
  poolId,
  chainId,
  humanBptIn,
  tokenOut,
  enabled = true,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const debouncedHumanBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId,
    humanBptIn: debouncedHumanBptIn,
    tokenOut,
  }
  const queryKey = removeLiquidityKeys.preview(params)

  const queryFn = async () =>
    handler.simulate({
      humanBptIn: debouncedHumanBptIn,
      tokenOut,
    })

  const result = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && Number(debouncedHumanBptIn) > 0,
    gcTime: 0,
    meta: sentryMetaForRemoveLiquidityHandler('Error in remove liquidity simulation query', {
      ...params,
      chainId,
    }),
    ...onlyExplicitRefetch,
  })
  return result
}