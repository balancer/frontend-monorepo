import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { getChainId } from '@repo/lib/config/app.config'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { UnstakeParams, useClaimAndUnstakeStep } from './useClaimAndUnstakeStep'
import { useMemo } from 'react'
import { useApproveMinterStep } from '@repo/lib/modules/staking/gauge/useMinterApprovalStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'

export function useClaimAndUnstakeSteps(unstakeParams: UnstakeParams): {
  isLoading: boolean
  steps: TransactionStep[]
} {
  const pool = unstakeParams.pool
  const chainId = getChainId(pool.chain)

  const {
    step: claimAndUnstakeStep,
    isLoading: isLoadingClaimAndUnstakeStep,
    hasUnclaimedBalRewards,
  } = useClaimAndUnstakeStep(unstakeParams)

  const relayerMode = useRelayerMode()
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const signRelayerStep = useSignRelayerStep(pool.chain)

  const { step: relayerApprovalStep, isLoading: isLoadingRelayerApprovalStep } =
    useApproveRelayerStep(chainId)

  const { step: minterApprovalStep, isLoading: isLoadingMinterApprovalStep } = useApproveMinterStep(
    pool.chain,
    hasUnclaimedBalRewards
  )

  const steps = useMemo((): TransactionStep[] => {
    const steps: TransactionStep[] = []

    if (hasUnclaimedBalRewards) {
      steps.push(minterApprovalStep)
    }

    steps.push(shouldSignRelayerApproval ? signRelayerStep : relayerApprovalStep)
    steps.push(claimAndUnstakeStep)

    return steps
  }, [relayerApprovalStep, claimAndUnstakeStep, minterApprovalStep, hasUnclaimedBalRewards])

  return {
    isLoading:
      isLoadingMinterApprovalStep || isLoadingRelayerApprovalStep || isLoadingClaimAndUnstakeStep,
    steps,
  }
}
