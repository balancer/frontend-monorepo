import { getChainId } from '@repo/lib/config/app.config'
import { useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { useApproveRelayerStep } from '../relayer/useApproveRelayerStep'
import { useRelayerMode } from '../relayer/useRelayerMode'
import { RawAmount } from '../tokens/approvals/approval-rules'
import { useTokenApprovalSteps } from '../tokens/approvals/useTokenApprovalSteps'
import { useSignRelayerStep } from '../transactions/transaction-steps/useSignRelayerStep'
import { orderRouteVersion } from './swap.helpers'
import { OSwapAction, SdkSimulateSwapResponse, SwapAction } from './swap.types'
import { useSignPermit2SwapStep } from './usePermit2SwapStep'
import { SwapStepParams, useSwapStep } from './useSwapStep'
import { permit2Address } from '../tokens/approvals/permit2/permit2.helpers'
import { isNativeAsset } from '../tokens/token.helpers'
import { useUserSettings } from '../user/settings/UserSettingsProvider'
import { usePermit2ApprovalSteps } from '../tokens/approvals/permit2/usePermit2ApprovalSteps'

type Params = SwapStepParams & {
  vaultAddress: Address
  isLbpSwap: boolean
  isLbpProjectTokenBuy: boolean
}

export function useSwapSteps({
  swapState,
  vaultAddress,
  handler,
  wethIsEth,
  simulationQuery,
  swapAction,
  tokenInInfo,
  tokenOutInfo,
  isLbpSwap,
  isLbpProjectTokenBuy,
}: Params) {
  const chain = swapState.selectedChain
  const chainId = getChainId(chain)

  const hasSimulationQuery = !!simulationQuery
  const isPermit2 = orderRouteVersion(simulationQuery) === 3

  const relayerMode = useRelayerMode()

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } = useApproveRelayerStep(
    chainId,
    { relayerMode }
  )
  const signRelayerStep = useSignRelayerStep(swapState.selectedChain)
  const swapRequiresRelayer =
    relayerMode !== 'no-relayer-needed' && handler.name === 'AuraBalSwapHandler'

  const { shouldUseSignatures } = useUserSettings()

  const tokenInAmounts = useMemo(() => {
    if (!tokenInInfo) return [] as RawAmount[]
    return [
      {
        address: tokenInInfo.address as Address,
        rawAmount: parseUnits(swapState.tokenIn.amount, tokenInInfo.decimals),
        symbol: tokenInInfo.symbol,
      },
    ]
  }, [swapState.tokenIn.amount, tokenInInfo])

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: isPermit2 ? permit2Address(chain) : vaultAddress,
      chain,
      approvalAmounts: tokenInAmounts,
      actionType: approvalActionType(isLbpSwap, swapAction),
      isPermit2,
      wethIsEth,
      enabled: hasSimulationQuery,
    })

  const signPermit2Step = useSignPermit2SwapStep({
    chainId,
    wethIsEth,
    tokenInInfo,
    simulationQuery,
    isPermit2,
  })
  const isSignPermit2Loading = isPermit2 && !signPermit2Step

  // If the user has selected to not use signatures, we allow them to do permit2
  // approvals with transactions.
  const queryData = simulationQuery.data as SdkSimulateSwapResponse
  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain,
      approvalAmounts: tokenInAmounts,
      actionType: approvalActionType(isLbpSwap, swapAction),
      enabled: isPermit2 && !shouldUseSignatures && hasSimulationQuery,
      router: queryData?.router,
    })

  const swapStep = useSwapStep({
    handler,
    wethIsEth,
    swapState,
    simulationQuery,
    swapAction,
    tokenInInfo,
    tokenOutInfo,
    isLbpSwap,
    isLbpProjectTokenBuy,
  })

  // native tokenIn does not require permit2 signature
  const isNativeTokenIn = tokenInInfo && isNativeAsset(tokenInInfo?.address, chain)

  const steps = useMemo(() => {
    const stepList = []

    if (swapRequiresRelayer) {
      if (relayerMode === 'approveRelayer') stepList.push(approveRelayerStep)
      else stepList.push(signRelayerStep)
    }

    stepList.push(...tokenApprovalSteps)

    if (isPermit2 && signPermit2Step && !isNativeTokenIn) {
      if (shouldUseSignatures) stepList.push(signPermit2Step)
      else stepList.push(...permit2ApprovalSteps)
    }

    stepList.push(swapStep)

    return stepList
  }, [
    swapRequiresRelayer,
    tokenApprovalSteps,
    isPermit2,
    swapStep,
    signPermit2Step,
    permit2ApprovalSteps,
    relayerMode,
    approveRelayerStep,
    signRelayerStep,
    isNativeTokenIn,
    shouldUseSignatures,
  ])

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps ||
      isLoadingRelayerApproval ||
      isSignPermit2Loading ||
      isLoadingPermit2ApprovalSteps,
    steps,
  }
}

function approvalActionType(isLBP: boolean, swapAction: SwapAction) {
  if (isLBP) return 'Buying'
  else if (swapAction === OSwapAction.UNWRAP) return 'Unwrapping'

  return 'Swapping'
}
