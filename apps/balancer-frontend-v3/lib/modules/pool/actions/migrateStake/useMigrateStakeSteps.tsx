import { TransactionStep } from '@/lib/modules/transactions/transaction-steps/lib'
import { Pool } from '../../PoolProvider'
import { useEffect, useMemo, useState } from 'react'
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
  const [hasClaimStep, setHasClaimStep] = useState(false)
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
    if (hasClaimStep) return [...claimAndUnstakeSteps, ...stakeSteps]
    return [unstakeStep, ...stakeSteps]
  }, [unstakeStep, stakeSteps, claimAndUnstakeSteps, hasClaimStep])

  useEffect(() => {
    if (isClaimable) {
      // We need to save this state to keep using claimAndUnstakeSteps during the whole flow
      setHasClaimStep(true)
    }
  }, [isClaimable])

  return {
    isLoading: isLoadingSteps,
    isClaimable,
    steps,
  }
}
