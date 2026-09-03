import { useApproveMinterStep } from '@repo/lib/modules/staking/gauge/useMinterApprovalStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { ClaimAllRewardsStepParams, useClaimAllRewardsStep } from './useClaimAllRewardsStep'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { getChainId } from '@repo/lib/config/app.config'
import { useShouldBatchTransactions } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'

export function useClaimAllRewardsSteps(params: ClaimAllRewardsStepParams) {
  const pool = params.pools[0]

  if (!pool) {
    throw new Error('Pools should contain at least one element')
  }

  const { chain } = pool
  const chainId = getChainId(pool.chain)
  const hasUnclaimedBalRewards = params.balTokenRewardsQuery.balRewardsData.length > 0

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId)

  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } = useApproveMinterStep(
    chain,
    hasUnclaimedBalRewards
  )

  const { step: claimAllRewardsStep, isLoading: isLoadingClaimAllRewards } =
    useClaimAllRewardsStep(params)

  const shouldBatchTransactions = useShouldBatchTransactions()

  // Approvals are executed inside the same atomic batch as the multicall, so they
  // are hidden from the step list when batching (mirrors remove-liquidity).
  const steps = useMemo(
    () =>
      getApprovalAndClaimSteps({
        claimAllRewardsStep,
        minterApprovalStep,
        relayerApprovalStep,
        hasUnclaimedBalRewards,
        shouldBatchTransactions,
      }),
    [
      claimAllRewardsStep,
      minterApprovalStep,
      relayerApprovalStep,
      hasUnclaimedBalRewards,
      shouldBatchTransactions,
    ]
  )

  return {
    isLoading:
      isLoadingRelayerApprovalStep || isLoadingMinterApprovalStep || isLoadingClaimAllRewards,
    steps,
  }
}

export function getApprovalAndClaimSteps({
  claimAllRewardsStep,
  minterApprovalStep,
  relayerApprovalStep,
  hasUnclaimedBalRewards,
  shouldBatchTransactions,
}: {
  claimAllRewardsStep: TransactionStep
  minterApprovalStep: TransactionStep
  relayerApprovalStep: TransactionStep
  hasUnclaimedBalRewards: boolean
  shouldBatchTransactions: boolean
}): TransactionStep[] {
  const approvalSteps: TransactionStep[] = []

  if (hasUnclaimedBalRewards) {
    approvalSteps.push(minterApprovalStep)
  }

  approvalSteps.push(relayerApprovalStep)

  // Approvals that can be batched with the multicall are attached as nested steps
  claimAllRewardsStep.nestedSteps = approvalSteps

  // When batching, the approvals are hidden from the step list (they run inside
  // the same atomic transaction as the claim multicall)
  return shouldBatchTransactions ? [claimAllRewardsStep] : [...approvalSteps, claimAllRewardsStep]
}
