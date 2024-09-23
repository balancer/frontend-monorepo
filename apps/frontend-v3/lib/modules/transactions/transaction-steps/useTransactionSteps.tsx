/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { getTransactionState, TransactionState, TransactionStep } from './lib'
import { useTransactionState } from './TransactionStateProvider'
import { useTxSound } from './useTxSound'

export type TransactionStepsResponse = ReturnType<typeof useTransactionSteps>

export function useTransactionSteps(steps: TransactionStep[] = [], isLoading = false) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [onSuccessCalled, setOnSuccessCalled] = useState<{ [stepId: string]: boolean }>({})

  const updateOnSuccessCalled = (stepId: string, value: boolean) => {
    setOnSuccessCalled(prevState => ({
      ...prevState,
      [stepId]: value,
    }))
  }

  const isOnSuccessCalled = (stepId: string) => !!onSuccessCalled[stepId]

  const { getTransaction, resetTransactionState } = useTransactionState()
  const { playTxSound } = useTxSound()

  const currentStep = steps[currentStepIndex]
  const currentTransaction = currentStep ? getTransaction(currentStep.id) : undefined
  const isCurrentStepComplete = currentStep?.isComplete() || false
  const lastStepIndex = steps?.length ? steps.length - 1 : 0
  const lastStep = steps?.[lastStepIndex]
  const lastTransaction = lastStep ? getTransaction(lastStep.id) : undefined

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
    resetTransactionState()
  }

  // Trigger side effects on transaction completion. The step itself decides
  // when it's complete. e.g. so approvals can refetch to check correct
  // allowance has been given.
  useEffect(() => {
    if (!currentStep) return
    if (!isOnSuccessCalled(currentStep.id) && currentTransaction?.result.isSuccess) {
      currentStep?.onSuccess?.()
      updateOnSuccessCalled(currentStep.id, true)
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
