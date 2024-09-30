import { useMemo } from 'react'
import { ClaimAllRewardsStepParams, useClaimAllRewardsStep } from './useClaimAllRewardsStep'
import { getChainId } from '../../../../config/app.config'
import { useApproveRelayerStep } from '../../../relayer/useApproveRelayerStep'
import { useApproveMinterStep } from '../../../staking/gauge/useMinterApprovalStep'
import { TransactionStep } from '../../../transactions/transaction-steps/lib'

export function useClaimAllRewardsSteps(params: ClaimAllRewardsStepParams) {
  const pool = params.pools[0]
  if (!pool) {
    throw new Error('Pools should contain at least one element')
  }

  const { chain } = pool
  const chainId = getChainId(pool.chain)

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId)
  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } =
    useApproveMinterStep(chain)

  const { step: claimAllRewardsStep, isLoading: isLoadingClaimAllRewards } =
    useClaimAllRewardsStep(params)

  const steps = useMemo((): TransactionStep[] => {
    const steps = [relayerApprovalStep, claimAllRewardsStep]

    if (params.balTokenRewardsQuery.balRewardsData.length > 0) {
      steps.unshift(minterApprovalStep)
    }

    return steps
  }, [relayerApprovalStep, claimAllRewardsStep, minterApprovalStep, params])

  return {
    isLoading:
      isLoadingRelayerApprovalStep || isLoadingMinterApprovalStep || isLoadingClaimAllRewards,
    steps,
  }
}
