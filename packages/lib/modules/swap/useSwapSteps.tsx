import { getChainId } from '@repo/lib/config/app.config'
import { useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { useShouldSignRelayerApproval } from '../relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '../relayer/useApproveRelayerStep'
import { useRelayerMode } from '../relayer/useRelayerMode'
import { ApprovalAction } from '../tokens/approvals/approval-labels'
import { RawAmount } from '../tokens/approvals/approval-rules'
import { useTokenApprovalSteps } from '../tokens/approvals/useTokenApprovalSteps'
import { useSignRelayerStep } from '../transactions/transaction-steps/useSignRelayerStep'
import { orderRouteVersion } from './swap.helpers'
import { OSwapAction } from './swap.types'
import { useSignPermit2SwapStep } from './usePermit2SwapStep'
import { SwapStepParams, useSwapStep } from './useSwapStep'
import { permit2Address } from '../tokens/approvals/permit2/permit2.helpers'

type Params = SwapStepParams & {
  vaultAddress: Address
  // TODO: remove this field once we refactor to use:
  // https://github.com/balancer/b-sdk/issues/462
  isPoolSwap: boolean
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
  const chain = swapState.selectedChain
  const chainId = getChainId(chain)

  const isPermit2 = orderRouteVersion(simulationQuery) === 3

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
      spenderAddress: isPermit2 ? permit2Address(chain) : vaultAddress,
      chain,
      approvalAmounts: tokenInAmounts,
      actionType: approvalActionType,
      isPermit2,
    })

  const signPermit2Step = useSignPermit2SwapStep({
    chainId,
    wethIsEth,
    tokenInInfo,
    simulationQuery,
    isPermit2,
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

  const isSignPermit2Loading = isPermit2 && !signPermit2Step

  const steps = useMemo(() => {
    const swapSteps = isPermit2 && signPermit2Step ? [signPermit2Step, swapStep] : [swapStep]

    if (swapRequiresRelayer) {
      if (relayerMode === 'approveRelayer') {
        return [approveRelayerStep, ...tokenApprovalSteps, ...swapSteps]
      } else if (shouldSignRelayerApproval) {
        return [signRelayerStep, ...tokenApprovalSteps, ...swapSteps]
      }
    }
    return [...tokenApprovalSteps, ...swapSteps]
  }, [
    swapRequiresRelayer,
    tokenApprovalSteps,
    isPermit2,
    swapStep,
    signPermit2Step,
    relayerMode,
    shouldSignRelayerApproval,
    approveRelayerStep,
    signRelayerStep,
  ])

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps || isLoadingRelayerApproval || isSignPermit2Loading,
    steps,
  }
}
