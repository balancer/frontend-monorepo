import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { defaultDebounceMs, onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { usePool } from '../../../PoolProvider'
import { ensureLastQueryResponse } from '../../LiquidityActionHelpers'
import { AddLiquidityParams, addLiquidityKeys } from './add-liquidity-keys'
import { useRelayerSignature } from '@/lib/modules/relayer/RelayerSignatureProvider'
import { sentryMetaForAddLiquidityHandler } from '@/lib/shared/utils/query-errors'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { AddLiquiditySimulationQueryResult } from './useAddLiquiditySimulationQuery'
import { useDebounce } from 'use-debounce'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { useBlockNumber } from 'wagmi'
import { usePermit2Signature } from '@/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { isV3Pool } from '../../../pool.helpers'

export type AddLiquidityBuildQueryResponse = ReturnType<typeof useAddLiquidityBuildCallDataQuery>

export type AddLiquidityBuildQueryParams = {
  handler: AddLiquidityHandler
  humanAmountsIn: HumanTokenAmountWithAddress[]
  simulationQuery: AddLiquiditySimulationQueryResult
  slippage: string
}

// Uses the SDK to build a transaction config to be used by wagmi's useManagedSendTransaction
export function useAddLiquidityBuildCallDataQuery({
  handler,
  humanAmountsIn,
  simulationQuery,
  slippage,
  enabled,
}: AddLiquidityBuildQueryParams & {
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const { pool, chainId } = usePool()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const { relayerApprovalSignature } = useRelayerSignature()
  const { permit2Signature: permit2 } = usePermit2Signature()
  const debouncedHumanAmountsIn = useDebounce(humanAmountsIn, defaultDebounceMs)[0]

  const hasPermit2 = isV3Pool(pool) && !!permit2

  const params: AddLiquidityParams = {
    handler,
    userAddress,
    slippage,
    pool,
    humanAmountsIn: debouncedHumanAmountsIn,
    hasPermit2,
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
      permit2, // only present in V3 pools
    })
    console.log('Call data built:', response)
    if (permit2) console.log('permit2 for call data:', permit2)
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
