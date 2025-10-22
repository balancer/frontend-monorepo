import { useApproveMinterStep } from '@repo/lib/modules/staking/gauge/useMinterApprovalStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { ClaimAllRewardsStepParams, useClaimAllRewardsStep } from './useClaimAllRewardsStep'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { getChainId } from '@repo/lib/config/app.config'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'

export function useClaimAllRewardsSteps(params: ClaimAllRewardsStepParams) {
  const pool = params.pools[0]

  if (!pool) {
    throw new Error('Pools should contain at least one element')
  }

  const relayerMode = useRelayerMode()

  const { chain } = pool
  const chainId = getChainId(pool.chain)
  const hasUnclaimedBalRewards = params.balTokenRewardsQuery.balRewardsData.length > 0

  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const signRelayerStep = useSignRelayerStep(chain)

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId, { relayerMode })

  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } = useApproveMinterStep(
    chain,
    hasUnclaimedBalRewards
  )

  const { step: claimAllRewardsStep, isLoading: isLoadingClaimAllRewards } =
    useClaimAllRewardsStep(params)

  const steps = useMemo((): TransactionStep[] => {
    const steps: TransactionStep[] = []

    if (hasUnclaimedBalRewards) {
      steps.push(minterApprovalStep)
    }

    steps.push(shouldSignRelayerApproval ? signRelayerStep : relayerApprovalStep)
    steps.push(claimAllRewardsStep)

    return steps
  }, [
    relayerApprovalStep,
    claimAllRewardsStep,
    minterApprovalStep,
    hasUnclaimedBalRewards,
    signRelayerStep,
  ])

  return {
    isLoading:
      isLoadingRelayerApprovalStep || isLoadingMinterApprovalStep || isLoadingClaimAllRewards,
    steps,
  }
}
