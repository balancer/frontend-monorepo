import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { Pool } from '../../pool.types'
import { useMemo } from 'react'
import { useUnstakeFromNonPreferentialGaugeStep } from './useUnstakeFromNonPreferentialGaugeStep'
import { useStakeSteps } from '../stake/useStakeSteps'
import { HumanAmount } from '@balancer/sdk'
import { findFirstNonPreferentialStaking } from '../stake.helpers'
import { useClaimAndUnstakeSteps } from '../unstake/useClaimAndUnstakeSteps'
import { Address } from 'viem'

export function useMigrateStakeSteps(
  pool: Pool,
  migratedAmount: HumanAmount,
  refetchPoolBalances: () => void
) {
  const { nonPreferentialGaugeAddress, nonPreferentialStakedBalance, isClaimable } =
    findFirstNonPreferentialStaking(pool)

  const { step: unstakeStep } = useUnstakeFromNonPreferentialGaugeStep(pool, refetchPoolBalances)

  const { steps: claimAndUnstakeSteps } = useClaimAndUnstakeSteps({
    pool,
    gaugeAddress: nonPreferentialGaugeAddress as Address,
    amountOut: nonPreferentialStakedBalance as HumanAmount,
    refetchPoolBalances,
  })

  // Stake in preferential gauge
  const { steps: stakeSteps, isLoadingSteps } = useStakeSteps(pool, migratedAmount)

  const steps = useMemo((): TransactionStep[] => {
    if (isClaimable) return [...claimAndUnstakeSteps, ...stakeSteps]
    return [unstakeStep, ...stakeSteps]
  }, [unstakeStep, stakeSteps, claimAndUnstakeSteps, isClaimable])

  return {
    isLoading: isLoadingSteps,
    isClaimable,
    steps,
  }
}
