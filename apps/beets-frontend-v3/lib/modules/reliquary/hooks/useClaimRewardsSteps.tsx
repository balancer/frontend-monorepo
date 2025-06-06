import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useClaimRewardsStep } from './useClaimRewardsStep'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'

export function useClaimRewardsSteps(chain: GqlChain, relicId: string | undefined) {
  const chainId = getChainId(chain)
  const { step: relayerApprovalRelicsStep, isLoading } = useApproveRelayerRelicsStep(chainId)
  const { step: claimRewardsStep } = useClaimRewardsStep(chain, relicId)

  const steps: TransactionStep[] = [relayerApprovalRelicsStep, claimRewardsStep]

  return {
    isLoading,
    steps,
  }
}
