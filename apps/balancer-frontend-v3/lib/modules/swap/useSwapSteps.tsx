import { useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { ApprovalAction } from '../tokens/approvals/approval-labels'
import { RawAmount } from '../tokens/approvals/approval-rules'
import { useTokenApprovalSteps } from '../tokens/approvals/useTokenApprovalSteps'
import { OSwapAction } from './swap.types'
import { SwapStepParams, useSwapStep } from './useSwapStep'
import { useRelayerMode } from '../relayer/useRelayerMode'
import { useShouldSignRelayerApproval } from '../relayer/signRelayerApproval.hooks'
import { getChainId } from '@/lib/config/app.config'
import { useApproveRelayerStep } from '../relayer/useApproveRelayerStep'
import { useSignRelayerStep } from '../transactions/transaction-steps/useSignRelayerStep'

type Params = SwapStepParams & {
  vaultAddress: Address
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
}: Params) {
  const chainId = getChainId(swapState.selectedChain)

  const relayerMode = useRelayerMode()
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)
  const signRelayerStep = useSignRelayerStep(swapState.selectedChain)

  const swapRequiresRelayer = handler.name === 'AuraBalSwapHandler'

  const humanAmountIn = swapState.tokenIn.amount
  const tokenInAmounts = useMemo(() => {
    if (!tokenInInfo) return [] as RawAmount[]
    return [
      {
        address: tokenInInfo.address as Address,
        rawAmount: parseUnits(humanAmountIn, tokenInInfo.decimals),
      },
    ]
  }, [humanAmountIn, tokenInInfo])

  const approvalActionType: ApprovalAction =
    swapAction === OSwapAction.UNWRAP ? 'Unwrapping' : 'Swapping'

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: vaultAddress,
      chain: swapState.selectedChain,
      approvalAmounts: tokenInAmounts,
      actionType: approvalActionType,
    })

  const swapStep = useSwapStep({
    handler,
    wethIsEth,
    swapState,
    simulationQuery,
    swapAction,
    tokenInInfo,
    tokenOutInfo,
  })

  const steps = useMemo(() => {
    if (swapRequiresRelayer) {
      if (relayerMode === 'approveRelayer') {
        return [approveRelayerStep, ...tokenApprovalSteps, swapStep]
      } else if (shouldSignRelayerApproval) {
        return [signRelayerStep, ...tokenApprovalSteps, swapStep]
      }
    }
    return [...tokenApprovalSteps, swapStep]
  }, [
    swapRequiresRelayer,
    tokenApprovalSteps,
    swapStep,
    relayerMode,
    shouldSignRelayerApproval,
    approveRelayerStep,
    signRelayerStep,
  ])

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps || isLoadingRelayerApproval,
    steps,
  }
}
