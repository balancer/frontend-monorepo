/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { createContext, PropsWithChildren } from 'react'
import { usePool } from '../../PoolProvider'
import { useUnstake } from '../unstake/UnstakeProvider'
import { useMigrateStakeSteps } from './useMigrateStakeSteps'
import { LABELS } from '../../../../shared/labels'
import { useMandatoryContext } from '../../../../shared/utils/contexts'
import { isDisabledWithReason } from '../../../../shared/utils/functions/isDisabledWithReason'
import { isZero } from '../../../../shared/utils/numbers'
import { useTransactionSteps } from '../../../transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '../../../web3/UserAccountProvider'

export type UseMigrateStakeResponse = ReturnType<typeof _useMigrateStake>
export const MigrateStakeContext = createContext<UseMigrateStakeResponse | null>(null)

export function _useMigrateStake() {
  const { quoteAmountOut: migratedAmount } = useUnstake()

  const { pool, refetch: refetchPoolBalances, isLoading: isLoadingPool } = usePool()
  const { isConnected } = useUserAccount()

  const { steps, isLoading, isClaimable } = useMigrateStakeSteps(
    pool,
    migratedAmount,
    refetchPoolBalances,
  )
  const transactionSteps = useTransactionSteps(steps, isLoading)

  const restakeTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [isZero(migratedAmount), "There's no staked amount to be migrated"],
  )

  return {
    isLoading: isLoadingPool || isLoading,
    transactionSteps,
    isDisabled,
    disabledReason,
    restakeTxHash,
    migratedAmount,
    isClaimable,
  }
}

export function MigrateStakeProvider({ children }: PropsWithChildren) {
  const hook = _useMigrateStake()
  return <MigrateStakeContext.Provider value={hook}>{children}</MigrateStakeContext.Provider>
}

export const useMigrateStake = (): UseMigrateStakeResponse =>
  useMandatoryContext(MigrateStakeContext, 'MigrateStake')
