import { RawAmount } from '@repo/lib/modules/tokens/approvals/approval-rules'
import { LockActionType } from '@repo/lib/modules/vebal/lock/steps/lock-steps.utils'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { useLockStep } from '@repo/lib/modules/vebal/lock/steps/useLockStep'
import { useMemo } from 'react'
import { TransactionStep } from '../../../transactions/transaction-steps/lib'
import { Hex } from 'viem'

type UseLockStepsArgs = {
  lockAmount: RawAmount
  lockEndDate: string
  lockActionTypes: LockActionType[]
}

export function useLockSteps({ lockAmount, lockEndDate, lockActionTypes }: UseLockStepsArgs) {
  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: mainnetNetworkConfig.contracts.veBAL as Hex,
      chain: mainnetNetworkConfig.chain,
      approvalAmounts: [lockAmount],
      actionType: 'Locking',
      lpToken: 'token',
    })

  const unlockStep = useLockStep({ lockAmount, lockEndDate, lockActionType: LockActionType.Unlock })
  const createLockStep = useLockStep({
    lockAmount,
    lockEndDate,
    lockActionType: LockActionType.CreateLock,
  })
  const increaseLockStep = useLockStep({
    lockAmount,
    lockEndDate,
    lockActionType: LockActionType.IncreaseLock,
  })
  const extendLockStep = useLockStep({
    lockAmount,
    lockEndDate,
    lockActionType: LockActionType.ExtendLock,
  })

  const steps = useMemo(() => {
    const lockSteps = [unlockStep, createLockStep, extendLockStep, increaseLockStep]
    const selectedLockSteps = lockActionTypes
      .map(lockActionType => lockSteps.find(lockStep => lockStep.stepType === lockActionType))
      .filter(Boolean) as TransactionStep[]
    return [...tokenApprovalSteps, ...selectedLockSteps]
  }, [
    tokenApprovalSteps,
    unlockStep,
    createLockStep,
    extendLockStep,
    increaseLockStep,
    lockActionTypes,
  ])

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps,
    steps,
  }
}
