import { useApproveMinterStep } from '@repo/lib/modules/staking/gauge/useMinterApprovalStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { ClaimAllRewardsStepParams, useClaimAllRewardsStep } from './useClaimAllRewardsStep'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { getChainId } from '@repo/lib/config/app.config'

export function useClaimAllRewardsSteps(params: ClaimAllRewardsStepParams) {
  const pool = params.pools[0]

  if (!pool) {
    throw new Error('Pools should contain at least one element')
  }

  const { chain } = pool
  const chainId = getChainId(pool.chain)
  const hasUnclaimedBalRewards = params.balTokenRewardsQuery.balRewardsData.length > 0

  const relayerMode = 'approveRelayer' // relayer is always needed to claim rewards from gauges

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId, { relayerMode })

  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } = useApproveMinterStep(
    chain,
    hasUnclaimedBalRewards
  )

  const { step: claimAllRewardsStep, isLoading: isLoadingClaimAllRewards } =
    useClaimAllRewardsStep(params)

  const steps = useMemo((): TransactionStep[] => {
    const steps = [relayerApprovalStep, claimAllRewardsStep]

    if (hasUnclaimedBalRewards) {
      steps.unshift(minterApprovalStep)
    }

    return steps
  }, [relayerApprovalStep, claimAllRewardsStep, minterApprovalStep, hasUnclaimedBalRewards])

  return {
    isLoading:
      isLoadingRelayerApprovalStep || isLoadingMinterApprovalStep || isLoadingClaimAllRewards,
    steps,
  }
}
