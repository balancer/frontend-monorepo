'use client'

import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { isZero } from '@repo/lib/shared/utils/numbers'
import { createContext, PropsWithChildren } from 'react'
import { usePool } from '../../PoolProvider'
import { useUnstake } from '../unstake/UnstakeProvider'
import { useMigrateStakeSteps } from './useMigrateStakeSteps'

export type UseMigrateStakeResponse = ReturnType<typeof useMigrateStakeLogic>
export const MigrateStakeContext = createContext<UseMigrateStakeResponse | null>(null)

export function useMigrateStakeLogic() {
  const { quoteAmountOut: migratedAmount } = useUnstake()

  const { pool, refetch: refetchPoolBalances, isLoading: isLoadingPool } = usePool()
  const { isConnected } = useUserAccount()

  const { steps, isLoading, isClaimable } = useMigrateStakeSteps(
    pool,
    migratedAmount,
    refetchPoolBalances
  )
  const transactionSteps = useTransactionSteps(steps, isLoading)

  const restakeTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [isZero(migratedAmount), "There's no staked amount to be migrated"]
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
  const hook = useMigrateStakeLogic()
  return <MigrateStakeContext.Provider value={hook}>{children}</MigrateStakeContext.Provider>
}

export const useMigrateStake = (): UseMigrateStakeResponse =>
  useMandatoryContext(MigrateStakeContext, 'MigrateStake')
