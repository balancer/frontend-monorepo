import { useMemo } from 'react'
import { LockActionType } from '@repo/lib/modules/vebal/lock/steps/lock-steps.utils'
import { useLockSteps } from '@repo/lib/modules/vebal/lock/steps/useLockSteps'
import { Address, parseUnits } from 'viem'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { UseVebalLockDataResult } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { useVebalLock, UseVebalLockResult } from '@repo/lib/modules/vebal/lock/VebalLockProvider'

export interface UseBuildLockStepsArgs {
  extendExpired: boolean
  totalAmount: UseVebalLockResult['totalAmount']
  lockDuration: UseVebalLockResult['lockDuration']
  isIncreasedLockAmount: UseVebalLockResult['isIncreasedLockAmount']
  mainnetLockedInfo: UseVebalLockDataResult['mainnetLockedInfo']
}

export function useBuildLockSteps({
  extendExpired,
  lockDuration,
  isIncreasedLockAmount,
  totalAmount,
  mainnetLockedInfo,
}: UseBuildLockStepsArgs) {
  const { vebalBptToken } = useVebalLock()

  const lockActionTypes = useMemo(() => {
    if (mainnetLockedInfo.isExpired) {
      if (extendExpired) {
        return [LockActionType.Unlock, LockActionType.CreateLock]
      } else {
        return [LockActionType.Unlock]
      }
    }
    if (mainnetLockedInfo.hasExistingLock && !mainnetLockedInfo.isExpired) {
      if (isIncreasedLockAmount && lockDuration.isExtendedLockEndDate) {
        return [LockActionType.IncreaseLock, LockActionType.ExtendLock]
      }
      if (lockDuration.isExtendedLockEndDate) {
        return [LockActionType.ExtendLock]
      }
      if (isIncreasedLockAmount) {
        return [LockActionType.IncreaseLock]
      }
    }
    return [LockActionType.CreateLock]
  }, [mainnetLockedInfo, isIncreasedLockAmount, lockDuration.isExtendedLockEndDate, extendExpired])

  const { steps, isLoadingSteps } = useLockSteps({
    lockAmount: {
      rawAmount: parseUnits(totalAmount.toString(), vebalBptToken.decimals),
      address: vebalBptToken.address as Address,
    },
    lockActionTypes,
    lockEndDate: lockDuration.lockEndDate.toString(),
  })

  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const lockTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    transactionSteps,
    lockTxHash,
  }
}
