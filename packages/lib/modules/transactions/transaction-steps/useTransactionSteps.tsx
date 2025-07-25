/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { getTransactionState, Retry, TransactionState, TransactionStep } from './lib'
import { useTxSound } from './useTxSound'
import { ensureError, ErrorCause, ErrorWithCauses } from '@repo/lib/shared/utils/errors'
import { useToast } from '@chakra-ui/react'
import { resetTransaction } from './transaction.helper'
import { showErrorAsToast } from '@repo/lib/shared/components/toasts/toast.helper'
import { useTransactionState } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export type TransactionStepsResponse = ReturnType<typeof useTransactionSteps>

export function useTransactionSteps(steps: TransactionStep[] = [], isLoading = false) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const { isOnSuccessCalled, updateOnSuccessCalled, setOnSuccessCalled } = useTransactionState()

  const { playTxSound } = useTxSound()

  const currentStep = steps[currentStepIndex]

  const currentTransaction = currentStep?.transaction

  const isCurrentStepComplete = currentStep?.isComplete() || false
  const lastStepIndex = steps?.length ? steps.length - 1 : 0
  const lastStep = steps?.[lastStepIndex]
  const lastTransaction = lastStep?.transaction

  const lastTransactionState = getTransactionState(lastTransaction)
  const lastTransactionConfirmingOrConfirmed =
    lastTransactionState === TransactionState.Confirming ||
    lastTransactionState === TransactionState.Completed
  const lastTransactionConfirmed = lastTransactionState === TransactionState.Completed

  function isLastStep(index: number) {
    return steps?.length ? index === lastStepIndex : false
  }

  function resetTransactionSteps() {
    setCurrentStepIndex(0)
    setOnSuccessCalled({})
    steps.forEach(step => {
      if (step.transaction) resetTransaction(step.transaction)
    })
  }

  // Trigger side effects on transaction completion. The step itself decides
  // when it's complete. e.g. so approvals can refetch to check correct
  // allowance has been given.
  const toast = useToast()
  useEffect(() => {
    if (!currentStep) return

    async function handleTransactionCompletion(currentStep: TransactionStep) {
      try {
        const onSuccessResult = await currentStep?.onSuccess?.()
        if (onSuccessResult !== Retry) {
          updateOnSuccessCalled(currentStep, true)
        }
      } catch (e) {
        const error = ensureError(e)
        if (error instanceof ErrorWithCauses) {
          error.causes.map((cause: ErrorCause) => {
            showErrorAsToast(toast, cause)
          })
        } else {
          const cause = { id: 'error-inside-onSuccess', title: 'Error', description: error.message }
          showErrorAsToast(toast, cause)
        }
        if (currentTransaction) resetTransaction(currentTransaction)
      }
    }

    if (!isOnSuccessCalled(currentStep) && currentTransaction?.result.isSuccess) {
      handleTransactionCompletion(currentStep)
    }
  }, [currentTransaction?.result.isSuccess, currentStep?.onSuccess])

  // Control step flow here.
  useEffect(() => {
    if (isCurrentStepComplete && currentStepIndex < lastStepIndex) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }, [isCurrentStepComplete, currentStepIndex])

  // On step change, call activation callbacks if they exist
  useEffect(() => {
    // Run deactivation callbacks first
    steps.forEach((step, index) => {
      if (index !== currentStepIndex) step.onDeactivated?.()
    })

    steps?.[currentStepIndex]?.onActivated?.()
  }, [currentStepIndex, isLoading, steps.length])

  // If steps length changes reset to first step
  useEffect(() => {
    if (steps.length && currentStepIndex > 0) {
      setCurrentStepIndex(0)
    }
  }, [steps.length])

  // On last transaction success, play success sound.
  // TODO move this to a global tx state management system in later refactor.
  useEffect(() => {
    if (lastTransaction?.result.isSuccess && currentStep) {
      playTxSound(currentStep.stepType)
    }
  }, [lastTransaction?.result.isSuccess])

  return {
    steps,
    isLoading,
    currentStep,
    currentTransaction,
    currentStepIndex,
    lastTransaction,
    lastTransactionState,
    lastTransactionConfirmingOrConfirmed,
    lastTransactionConfirmed,
    isLastStep,
    setCurrentStepIndex,
    resetTransactionSteps,
  }
}
