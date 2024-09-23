/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { useTransactionSteps } from '@/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@/lib/shared/labels'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { isDisabledWithReason } from '@/lib/shared/utils/functions/isDisabledWithReason'
import { bn, isZero } from '@/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { PoolListItem } from '../../pool.types'
import { usePool } from '../../PoolProvider'
import { useClaimsData } from '../claim/useClaimsData'
import { useClaimAndUnstakeSteps } from './useClaimAndUnstakeSteps'
import { getUnstakeQuote } from '../stake.helpers'

export type UseUnstakeResponse = ReturnType<typeof _useUnstake>
export const UnstakeContext = createContext<UseUnstakeResponse | null>(null)

export function _useUnstake() {
  // State so that we can maintain the amounts in the modal after confirmation.
  const [quoteAmountOut, setQuoteAmountOut] = useState<HumanAmount>('0')
  const [quoteRewardAmounts, setQuoteRewardAmounts] = useState<HumanTokenAmountWithAddress[]>([])
  const [quoteTotalClaimableUsd, setQuoteTotalClaimableUsd] = useState<string>('0')

  const { pool, refetch: refetchPoolBalances, isLoading: isLoadingPool } = usePool()
  const { isConnected } = useUserAccount()

  const {
    hasNoRewards,
    allClaimableRewards,
    totalClaimableUsd,
    isLoading: isLoadingClaims,
  } = useClaimsData([pool] as unknown[] as PoolListItem[])

  const rewardAmounts: HumanTokenAmountWithAddress[] = useMemo(
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

  /**
   * Side-effects
   */
  useEffect(() => {
    // Avoid updating when the amountOut is zero, that is,
    // after the unstake transaction was completed and the pool balances refetched
    if (bn(amountOut).gt(0)) {
      setQuoteAmountOut(amountOut)
    }
  }, [amountOut])

  useEffect(() => {
    setQuoteRewardAmounts(rewardAmounts)
    setQuoteTotalClaimableUsd(totalClaimableUsd)
  }, [isLoadingClaims])

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
    quoteRewardAmounts,
    quoteTotalClaimableUsd,
    pool,
  }
}

export function UnstakeProvider({ children }: PropsWithChildren) {
  const hook = _useUnstake()
  return <UnstakeContext.Provider value={hook}>{children}</UnstakeContext.Provider>
}

export const useUnstake = (): UseUnstakeResponse => useMandatoryContext(UnstakeContext, 'Unstake')
