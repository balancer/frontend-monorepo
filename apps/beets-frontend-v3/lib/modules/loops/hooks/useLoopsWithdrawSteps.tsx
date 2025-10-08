import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useLoopsWithdrawStep } from './useLoopsWithdrawStep'
import { Address, parseUnits } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

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
  const { userAddress } = useUserAccount()

  const { step: withdrawStep } = useLoopsWithdrawStep(amountShares, chain, isWithdrawTab)

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: userAddress,
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
