import { getChainId } from '@repo/lib/config/app.config'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useApproveRelayerStep } from '../relayer/useApproveRelayerStep'
import { useRelayerMode, RelayerMode } from '../relayer/useRelayerMode'
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
import { hasSomePendingNestedTxInBatch } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.helpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { parseAmount } from '@repo/lib/shared/utils/numbers'

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
        rawAmount: parseAmount(swapState.tokenIn.amount, tokenInInfo.decimals),
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

  const shouldBatchTransactions = useShouldBatchTransactions()

  const steps = useMemo(
    () =>
      getApprovalAndSwapSteps({
        swapRequiresRelayer,
        relayerMode,
        approveRelayerStep,
        signRelayerStep,
        tokenApprovalSteps,
        isPermit2,
        signPermit2Step,
        permit2ApprovalSteps,
        shouldUseSignatures,
        isNativeTokenIn,
        shouldBatchTransactions,
        swapStep,
      }),
    [
      swapRequiresRelayer,
      relayerMode,
      approveRelayerStep,
      signRelayerStep,
      tokenApprovalSteps,
      isPermit2,
      signPermit2Step,
      permit2ApprovalSteps,
      shouldUseSignatures,
      isNativeTokenIn,
      shouldBatchTransactions,
      swapStep,
    ]
  )

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

export function getApprovalAndSwapSteps({
  swapRequiresRelayer,
  relayerMode,
  approveRelayerStep,
  signRelayerStep,
  tokenApprovalSteps,
  isPermit2,
  signPermit2Step,
  permit2ApprovalSteps,
  shouldUseSignatures,
  isNativeTokenIn,
  shouldBatchTransactions,
  swapStep,
}: {
  swapRequiresRelayer: boolean
  relayerMode: RelayerMode
  approveRelayerStep: TransactionStep
  signRelayerStep: TransactionStep
  tokenApprovalSteps: TransactionStep[]
  isPermit2: boolean
  signPermit2Step?: TransactionStep
  permit2ApprovalSteps: TransactionStep[]
  shouldUseSignatures: boolean
  isNativeTokenIn: boolean | undefined
  shouldBatchTransactions: boolean
  swapStep: TransactionStep
}): TransactionStep[] {
  const stepList: TransactionStep[] = []

  if (swapRequiresRelayer) {
    if (relayerMode === 'approveRelayer') stepList.push(approveRelayerStep)
    else stepList.push(signRelayerStep)
  }

  const isPermit2WithStep = isPermit2 && signPermit2Step && !isNativeTokenIn

  // Approvals that can be batched with the swap are attached as nested steps,
  // mirroring how add/remove liquidity bundle approvals for smart accounts.
  swapStep.nestedSteps = isPermit2WithStep
    ? shouldUseSignatures
      ? tokenApprovalSteps
      : [...tokenApprovalSteps, ...permit2ApprovalSteps]
    : tokenApprovalSteps

  const shouldDisplayBatch = shouldBatchTransactions && hasSomePendingNestedTxInBatch(swapStep)

  if (shouldDisplayBatch) {
    // Hide approvals when batching (they are executed in the same atomic tx as the swap).
    // The permit2 signature step stays visible: it is a gasless signature, not a batched call.
    if (isPermit2WithStep && shouldUseSignatures) stepList.push(signPermit2Step)
    stepList.push(swapStep)
    return stepList
  }

  stepList.push(...tokenApprovalSteps)

  if (isPermit2WithStep) {
    if (shouldUseSignatures) stepList.push(signPermit2Step)
    else stepList.push(...permit2ApprovalSteps)
  }

  stepList.push(swapStep)

  return stepList
}
