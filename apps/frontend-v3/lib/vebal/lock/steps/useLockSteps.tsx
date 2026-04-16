import { RawAmount } from '@repo/lib/modules/tokens/approvals/approval-rules'
import { useLockStep } from '@bal/lib/vebal/lock/steps/useLockStep'
import { useMemo } from 'react'
import { LockActionType } from '@repo/lib/modules/vebal/vote/vote.types'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'

type UseLockStepsArgs = {
  lockAmount: RawAmount
  lockEndDate: string
  lockActionTypes: LockActionType[]
}

export function useLockSteps({
  lockAmount: lockRawAmount,
  lockEndDate,
  lockActionTypes,
}: UseLockStepsArgs) {
  const lockAmount: bigint = lockRawAmount.rawAmount

  const unlockStep = useLockStep({
    lockAmount,
    lockEndDate,
    lockActionType: LockActionType.Unlock,
  })

  const steps = useMemo(() => {
    const lockSteps = [unlockStep]
    const selectedLockSteps = lockActionTypes
      .map(lockActionType => lockSteps.find(lockStep => lockStep.stepType === lockActionType))
      .filter(Boolean) as TransactionStep[]

    return [...selectedLockSteps]
  }, [unlockStep, lockActionTypes])

  return {
    steps,
  }
}
