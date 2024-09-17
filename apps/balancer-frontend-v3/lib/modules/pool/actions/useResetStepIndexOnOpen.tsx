import { useEffect } from 'react'
import { TransactionStepsResponse } from '../../transactions/transaction-steps/useTransactionSteps'

/*
  Used by flow modals:
  Every time the modal is opened, reset the current step index to re-check isCompleted for all steps
 (conditions might have changed, for instance, for token approvals)
 */
export function useResetStepIndexOnOpen(
  isOpen: boolean,
  transactionSteps: TransactionStepsResponse
) {
  useEffect(() => {
    if (isOpen) transactionSteps.setCurrentStepIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
}
