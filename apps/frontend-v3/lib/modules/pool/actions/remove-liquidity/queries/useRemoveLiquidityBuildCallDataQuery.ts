'use client'

import { useRelayerSignature } from '@/lib/modules/relayer/RelayerSignatureProvider'
import { usePermitSignature } from '@/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'
import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { sentryMetaForRemoveLiquidityHandler } from '@/lib/shared/utils/query-errors'
import { HumanAmount } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Address } from 'viem/accounts'
import { usePool } from '../../../PoolProvider'
import { ensureLastQueryResponse } from '../../LiquidityActionHelpers'
import { RemoveLiquidityHandler } from '../handlers/RemoveLiquidity.handler'
import { RemoveLiquidityParams, removeLiquidityKeys } from './remove-liquidity-keys'
import { RemoveLiquiditySimulationQueryResult } from './useRemoveLiquiditySimulationQuery'

export type RemoveLiquidityBuildQueryResponse = ReturnType<
  typeof useRemoveLiquidityBuildCallDataQuery
>

export type RemoveLiquidityBuildQueryParams = {
  humanBptIn: HumanAmount
  handler: RemoveLiquidityHandler
  simulationQuery: RemoveLiquiditySimulationQueryResult
  singleTokenOutAddress: Address
  wethIsEth: boolean
}

// Queries the SDK to create a transaction config to be used by wagmi's useManagedSendTransaction
export function useRemoveLiquidityBuildCallDataQuery({
  humanBptIn,
  handler,
  simulationQuery,
  singleTokenOutAddress,
  wethIsEth,
  enabled,
}: RemoveLiquidityBuildQueryParams & {
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const { pool, chainId } = usePool()
  const { relayerApprovalSignature } = useRelayerSignature()
  const { permitSignature } = usePermitSignature()
  const debouncedHumanBptIn = useDebounce(humanBptIn, defaultDebounceMs)[0]

  const params: RemoveLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    humanBptIn: debouncedHumanBptIn,
    tokenOut: singleTokenOutAddress, // only required by SingleToken removal
    wethIsEth,
  }

  const queryKey = removeLiquidityKeys.buildCallData(params)

  const queryFn = async () => {
    const queryOutput = ensureLastQueryResponse('Remove liquidity query', simulationQuery.data)
    const res = await handler.buildCallData({
      account: userAddress,
      slippagePercent: slippage,
      queryOutput,
      relayerApprovalSignature,
      wethIsEth,
      permit: permitSignature,
    })

    console.log('Call data built:', res)
    return res
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
    meta: sentryMetaForRemoveLiquidityHandler('Error in remove liquidity buildCallData query', {
      ...params,
      chainId,
    }),
    ...onlyExplicitRefetch,
  })
}
