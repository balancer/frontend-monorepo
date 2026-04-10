import { useLockSteps } from '@bal/lib/vebal/lock/steps/useLockSteps'
import { Address, parseUnits } from 'viem'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useVebalLock, UseVebalLockResult } from '@bal/lib/vebal/lock/VebalLockProvider'
import { UseVebalLockDataResult } from '@repo/lib/modules/vebal/VebalLockDataProvider'
import { LockActionType } from '@repo/lib/modules/vebal/vote/vote.types'

export interface UseBuildLockStepsArgs {
  totalAmount: UseVebalLockResult['totalAmount']
  lockDuration: UseVebalLockResult['lockDuration']
  mainnetLockedInfo: UseVebalLockDataResult['mainnetLockedInfo']
}

export function useBuildLockSteps({ lockDuration, totalAmount }: UseBuildLockStepsArgs) {
  const { vebalBptToken } = useVebalLock()

  const lockActionTypes = [LockActionType.Unlock]

  const { steps } = useLockSteps({
    lockAmount: {
      rawAmount: parseUnits(totalAmount.toString(), vebalBptToken.decimals),
      address: vebalBptToken.address as Address,
    },
    lockActionTypes,
    lockEndDate: lockDuration.lockEndDate.toString(),
  })

  const transactionSteps = useTransactionSteps(steps, false)

  const lockTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    transactionSteps,
    lockTxHash,
  }
}
