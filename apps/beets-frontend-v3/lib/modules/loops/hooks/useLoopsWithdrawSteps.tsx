import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useLoopsWithdrawStep } from './useLoopsWithdrawStep'
import { Address, parseUnits } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { getNetworkConfig } from '@repo/lib/config/app.config'

export function useLoopsWithdrawSteps({
  amountShares,
  chain,
  isWithdrawTab,
  loopedAsset,
}: {
  amountShares: string
  chain: GqlChain
  isWithdrawTab: boolean
  loopedAsset: ApiToken | undefined
}) {
  const { step: withdrawStep } = useLoopsWithdrawStep(amountShares, chain, isWithdrawTab)

  const networkConfig = getNetworkConfig(chain)

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: networkConfig.contracts.beets?.magpieLoopedSonicRouter as Address,
      chain,
      approvalAmounts: [
        {
          address: loopedAsset?.address as Address,
          rawAmount: parseUnits(amountShares, 18),
        },
      ],
      actionType: 'Withdrawing',
    })

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps,
    steps: [...tokenApprovalSteps, withdrawStep],
  }
}
