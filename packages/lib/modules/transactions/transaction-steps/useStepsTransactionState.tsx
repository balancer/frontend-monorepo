'use client'

import { useState } from 'react'
import { ManagedResult } from '@repo/lib/modules/transactions/transaction-steps/lib'

/*
  Used to handle transaction states in the case of multiple steps of the same type. For instance, token approval steps.
*/
export function useStepsTransactionState() {
  // transactions indexed by stepId
  type StepId = string
  const [transactionsState, setTransactionsState] = useState<Record<StepId, ManagedResult>>({})

  function getTransaction(stepId: StepId): ManagedResult | undefined {
    return transactionsState[stepId]
  }

  // Returns a function that sets the transaction state for a specific stepId
  function setTransactionFn(stepId: StepId) {
    return (transaction: ManagedResult) => {
      setTransactionsState(prevState => ({
        ...prevState,
        [stepId]: transaction,
      }))
    }
  }

  return { getTransaction, setTransactionFn }
}
