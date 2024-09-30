import { useQuery } from '@tanstack/react-query'
import { usePool } from '../../../PoolProvider'
import { ensureLastQueryResponse } from '../../LiquidityActionHelpers'
import { AddLiquidityParams, addLiquidityKeys } from './add-liquidity-keys'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { AddLiquiditySimulationQueryResult } from './useAddLiquiditySimulationQuery'
import { useDebounce } from 'use-debounce'
import { useBlockNumber } from 'wagmi'
import { defaultDebounceMs, onlyExplicitRefetch } from '../../../../../shared/utils/queries'
import { sentryMetaForAddLiquidityHandler } from '../../../../../shared/utils/query-errors'
import { useRelayerSignature } from '../../../../relayer/RelayerSignatureProvider'
import { HumanTokenAmountWithAddress } from '../../../../tokens/token.types'
import { useUserSettings } from '../../../../user/settings/UserSettingsProvider'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

export type AddLiquidityBuildQueryResponse = ReturnType<typeof useAddLiquidityBuildCallDataQuery>

export type AddLiquidityBuildQueryParams = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  simulationQuery: AddLiquiditySimulationQueryResult
}

// Uses the SDK to build a transaction config to be used by wagmi's useManagedSendTransaction
export function useAddLiquidityBuildCallDataQuery({
  handler,
  humanAmountsIn,
  simulationQuery,
  enabled,
}: AddLiquidityBuildQueryParams & {
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const { pool, chainId } = usePool()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const { relayerApprovalSignature } = useRelayerSignature()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    poolId: pool.id,
    poolType: pool.type,
    humanAmountsIn: debouncedHumanAmountsIn,
  }

  const queryKey = addLiquidityKeys.buildCallData(params)

  const queryFn = async () => {
    const queryOutput = ensureLastQueryResponse('Add liquidity query', simulationQuery.data)
    const response = await handler.buildCallData({
      account: userAddress,
      humanAmountsIn: debouncedHumanAmountsIn,
      slippagePercent: slippage,
      queryOutput,
      relayerApprovalSignature, // only present in Add Nested Liquidity with sign relayer mode
    })
    console.log('Call data built:', response)
    return response
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
    meta: sentryMetaForAddLiquidityHandler('Error in add liquidity buildCallData query', {
      ...params,
      chainId,
      blockNumber,
    }),
    ...onlyExplicitRefetch,
  })
}
