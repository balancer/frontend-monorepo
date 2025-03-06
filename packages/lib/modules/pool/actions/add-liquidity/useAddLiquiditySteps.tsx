/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { isBoosted, requiresPermit2Approval } from '../../pool.helpers'
import { LiquidityActionHelpers } from '../LiquidityActionHelpers'
import { AddLiquidityStepParams, useAddLiquidityStep } from './useAddLiquidityStep'
import { useSignPermit2AddStep } from './useSignPermit2AddStep'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { hasSomePendingNestedTxInBatch } from '@repo/lib/modules/transactions/transaction-steps/safe/safe.helpers'
import { usePermit2ApprovalSteps } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2ApprovalSteps'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'

type AddLiquidityStepsParams = AddLiquidityStepParams & {
  helpers: LiquidityActionHelpers
}

export function useAddLiquiditySteps({
  helpers,
  handler,
  humanAmountsIn,
  simulationQuery,
  slippage,
}: AddLiquidityStepsParams) {
  const { pool, chainId, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const relayerMode = useRelayerMode(pool)
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const { shouldUseSignatures } = useUserSettings()

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)
  const signRelayerStep = useSignRelayerStep(chain)

  const inputAmounts = useMemo(
    () => helpers.toInputAmounts(humanAmountsIn),
    [humanAmountsIn, helpers]
  )

  const isPermit2 = requiresPermit2Approval(pool)

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForAddLiquidity(pool),
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      isPermit2,
    })

  const wethIsEth = helpers.isNativeAssetIn(humanAmountsIn)

  const signPermit2Step = useSignPermit2AddStep({
    wethIsEth,
    humanAmountsIn,
    simulationQuery,
  })

  // If the user has selected to not use signatures, we allow them to do permit2
  // approvals with transactions.
  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      enabled: isPermit2 && !shouldUseSignatures,
      shouldUseCompositeLiquidityRouterBoosted: isBoosted(pool),
    })

  const isSignPermit2Loading = isPermit2 && !signPermit2Step

  const addLiquidityStep = useAddLiquidityStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
  })

  const shouldUsePermit2Signatures = isPermit2 && shouldUseSignatures && signPermit2Step
  const shouldUsePermit2Transactions = isPermit2 && !shouldUseSignatures && permit2ApprovalSteps

  const addSteps: TransactionStep[] = shouldUsePermit2Signatures
    ? [signPermit2Step, addLiquidityStep]
    : shouldUsePermit2Transactions
      ? [...permit2ApprovalSteps, addLiquidityStep]
      : [addLiquidityStep]

  addLiquidityStep.nestedSteps = tokenApprovalSteps
  const approveAndAddSteps =
    shouldBatchTransactions && hasSomePendingNestedTxInBatch(addLiquidityStep)
      ? [...addSteps] // Hide token approvals when batching
      : [...tokenApprovalSteps, ...addSteps]

  const steps = useMemo<TransactionStep[]>(() => {
    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, ...approveAndAddSteps]
    } else if (shouldSignRelayerApproval) {
      return [signRelayerStep, ...approveAndAddSteps]
    }

    return [...approveAndAddSteps]
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    tokenApprovalSteps,
    addLiquidityStep,
    approveRelayerStep,
    signRelayerStep,
    signPermit2Step,
    humanAmountsIn,
  ])

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps ||
      isLoadingRelayerApproval ||
      isLoadingPermit2ApprovalSteps ||
      isSignPermit2Loading,
    steps,
  }
}
