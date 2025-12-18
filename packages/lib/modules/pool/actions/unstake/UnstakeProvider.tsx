'use client'

import { HumanTokenAmount } from '@repo/lib/modules/tokens/token.types'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { bn, isZero } from '@repo/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react'
import { PoolListItem } from '../../pool.types'
import { usePool } from '../../PoolProvider'
import { useClaimsData } from '../claim/useClaimsData'
import { useClaimAndUnstakeSteps } from './useClaimAndUnstakeSteps'
import { getUnstakeQuote } from '../stake.helpers'

export type UseUnstakeResponse = ReturnType<typeof useUnstakeLogic>
export const UnstakeContext = createContext<UseUnstakeResponse | null>(null)

let lastNonZeroAmountOut: HumanAmount = '0'

export function useUnstakeLogic() {
  const { pool, refetch: refetchPoolBalances, isLoading: isLoadingPool } = usePool()
  const { isConnected } = useUserAccount()

  const {
    hasNoRewards,
    allClaimableRewards,
    totalClaimableUsd,
    isLoading: isLoadingClaims,
  } = useClaimsData([pool] as unknown[] as PoolListItem[])

  const rewardAmounts: HumanTokenAmount[] = useMemo(
    () =>
      allClaimableRewards.map(reward => ({
        tokenAddress: reward.tokenAddress,
        humanAmount: reward.humanBalance as HumanAmount,
      })),
    [allClaimableRewards]
  )

  const { gaugeAddress, amountOut } = getUnstakeQuote(pool)

  const { steps, isLoading: isLoadingSteps } = useClaimAndUnstakeSteps({
    pool,
    gaugeAddress,
    amountOut: amountOut,
    refetchPoolBalances,
  })

  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const unstakeTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const hasRewardAmounts = rewardAmounts.some(amount => !isZero(amount.humanAmount))

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [isZero(amountOut) && !hasRewardAmounts, "There's no staked amount to be unstaked"]
  )

  useEffect(() => {
    if (bn(amountOut).gt(0)) {
      lastNonZeroAmountOut = amountOut
    }
  }, [amountOut])

  // Avoid updating when the amountOut is zero,
  // that is, after the unstake transaction was completed and the pool balances refetched
  // instead return the last non-zero amountOut
  const quoteAmountOut = useMemo(() => {
    if (bn(amountOut).gt(0)) return amountOut
    return lastNonZeroAmountOut
  }, [amountOut])

  return {
    isLoading: isLoadingClaims || isLoadingSteps || isLoadingPool,
    transactionSteps,
    isDisabled: isDisabled,
    disabledReason: disabledReason,
    rewardAmounts,
    totalClaimableUsd,
    hasNoRewards,
    unstakeTxHash,
    quoteAmountOut,
    pool,
  }
}

export function UnstakeProvider({ children }: PropsWithChildren) {
  const hook = useUnstakeLogic()
  return <UnstakeContext.Provider value={hook}>{children}</UnstakeContext.Provider>
}

export const useUnstake = (): UseUnstakeResponse => useMandatoryContext(UnstakeContext, 'Unstake')
