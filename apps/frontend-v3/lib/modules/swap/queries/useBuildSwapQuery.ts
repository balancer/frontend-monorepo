import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { onlyExplicitRefetch } from '@/lib/shared/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { ensureLastQueryResponse } from '../../pool/actions/LiquidityActionHelpers'
import { SwapHandler } from '../handlers/Swap.handler'
import { SimulateSwapResponse, SwapState } from '../swap.types'
import { swapQueryKeys } from './swapQueryKeys'
import { SwapSimulationQueryResult } from './useSimulateSwapQuery'
import { useRelayerSignature } from '../../relayer/RelayerSignatureProvider'
import { SwapMetaParams, sentryMetaForSwapHandler } from '@/lib/shared/utils/query-errors'
import { getChainId } from '@/lib/config/app.config'
import { useBlockNumber } from 'wagmi'

export type BuildSwapQueryResponse = ReturnType<typeof useBuildSwapQuery>

export type BuildSwapQueryParams = {
  handler: SwapHandler
  simulationQuery: SwapSimulationQueryResult
  wethIsEth: boolean
  swapState: SwapState
}

// Uses the SDK to build a transaction config to be used by wagmi's useManagedSendTransaction
export function useBuildSwapQuery({
  handler,
  simulationQuery,
  wethIsEth,
  swapState,
  enabled,
}: BuildSwapQueryParams & {
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()
  const { relayerApprovalSignature } = useRelayerSignature()

  const { selectedChain, tokenIn, tokenOut, swapType } = swapState
  const chainId = getChainId(selectedChain)
  const { data: blockNumber } = useBlockNumber({ chainId })

  const queryKey = swapQueryKeys.build({
    selectedChain,
    account: userAddress,
    slippagePercent: slippage,
    simulateResponse: simulationQuery.data || ({} as SimulateSwapResponse),
  })

  const queryFn = async () => {
    const simulateResponse = ensureLastQueryResponse('Swap query', simulationQuery.data)

    const response = handler.build({
      tokenIn,
      tokenOut,
      swapType,
      account: userAddress,
      slippagePercent: slippage,
      selectedChain,
      simulateResponse,
      wethIsEth,
      relayerApprovalSignature,
    })
    console.log('Swap callData built:', response)

    return response
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled: enabled && isConnected && !!simulationQuery.data,
    gcTime: 0,
    meta: sentryMetaForSwapHandler('Error in swap buildCallData query', {
      chainId,
      blockNumber,
      handler,
      swapState,
      slippage,
      wethIsEth,
    } as SwapMetaParams),
    ...onlyExplicitRefetch,
  })
}
