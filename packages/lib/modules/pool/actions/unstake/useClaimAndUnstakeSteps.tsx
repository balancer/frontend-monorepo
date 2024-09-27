import { useApproveRelayerStep } from '../../modules/relayer/useApproveRelayerStep'
import { getChainId } from '../../config/app.config'
import { TransactionStep } from '../../modules/transactions/transaction-steps/lib'
import { UnstakeParams, useClaimAndUnstakeStep } from './useClaimAndUnstakeStep'

import { useMemo } from 'react'
import { useApproveMinterStep } from '../../modules/staking/gauge/useMinterApprovalStep'

export function useClaimAndUnstakeSteps(unstakeParams: UnstakeParams): {
  isLoading: boolean
  steps: TransactionStep[]
} {
  const pool = unstakeParams.pool
  const chainId = getChainId(pool.chain)

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId)
  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } = useApproveMinterStep(
    pool.chain
  )

  const {
    step: claimAndUnstakeStep,
    isLoading: isLoadingClaimAndUnstakeStep,
    hasUnclaimedBalRewards,
  } = useClaimAndUnstakeStep(unstakeParams)

  const steps = useMemo((): TransactionStep[] => {
    const steps = [relayerApprovalStep, claimAndUnstakeStep]
    if (hasUnclaimedBalRewards) {
      steps.unshift(minterApprovalStep)
    }
    return steps
  }, [relayerApprovalStep, claimAndUnstakeStep, minterApprovalStep, hasUnclaimedBalRewards])

  return {
    isLoading:
      isLoadingMinterApprovalStep || isLoadingRelayerApprovalStep || isLoadingClaimAndUnstakeStep,
    steps,
  }
}
