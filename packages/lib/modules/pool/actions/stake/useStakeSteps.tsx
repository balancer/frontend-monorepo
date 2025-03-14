import { Address, parseUnits } from 'viem'
import { Pool } from '../../pool.types'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { RawAmount } from '@repo/lib/modules/tokens/approvals/approval-rules'
import { BPT_DECIMALS } from '../../pool.constants'
import { useMemo } from 'react'
import { useStakeStep } from './useStakeStep'
import { getUserWalletBalance } from '../../user-balance.helpers'

export function useStakeSteps(pool: Pool, stakeAmount = getUserWalletBalance(pool)) {
  const rawAmount = parseUnits(stakeAmount || '0', BPT_DECIMALS)

  const amountToApprove: RawAmount = {
    rawAmount,
    address: pool.address as Address,
  }

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: pool.staking?.address as Address,
      chain: pool.chain,
      approvalAmounts: [amountToApprove],
      actionType: 'Staking',
      bptSymbol: 'LP token',
    })

  const stakingStep = useStakeStep(pool, rawAmount)

  const steps = useMemo(
    () => [...tokenApprovalSteps, stakingStep],
    [tokenApprovalSteps, stakingStep]
  )

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps,
    steps,
  }
}
