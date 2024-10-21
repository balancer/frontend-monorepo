import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useQuery } from '@tanstack/react-query'
import { ensureLastQueryResponse } from '../../pool/actions/LiquidityActionHelpers'
import { SwapHandler } from '../handlers/Swap.handler'
import { SimulateSwapResponse, SwapState } from '../swap.types'
import { swapQueryKeys } from './swapQueryKeys'
import { SwapSimulationQueryResult } from './useSimulateSwapQuery'
import { useRelayerSignature } from '../../relayer/RelayerSignatureProvider'
import { SwapMetaParams, sentryMetaForSwapHandler } from '@repo/lib/shared/utils/query-errors'
import { getChainId } from '@repo/lib/config/app.config'
import { useBlockNumber } from 'wagmi'
import { usePermit2Signature } from '../../tokens/approvals/permit2/Permit2SignatureProvider'

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
  const { permit2Signature: permit2 } = usePermit2Signature()

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
      permit2,
    })
    console.log('Swap callData built:', response)
    if (permit2) console.log('Swap permit2:', permit2)

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
