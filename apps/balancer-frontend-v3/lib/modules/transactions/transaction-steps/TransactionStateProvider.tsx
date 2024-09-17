'use client'

import { createContext, PropsWithChildren, useState } from 'react'
import { ManagedResult } from './lib'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { TransactionResult } from '../../web3/contracts/contract.types'

export function _useTransactionState() {
  const [transactionMap, setTransactionMap] = useState<Map<string, ManagedResult>>(new Map())

  function updateTransaction(k: string, v: ManagedResult) {
    // if creating transaction
    if (!transactionMap.has(k)) {
      /*
      When there was a previous transaction useWriteContract() will return the execution hash from that previous transaction,
      So we need to reset it to avoid issues with multiple "managedTransaction" steps running in sequence.
      More info: https://wagmi.sh/react/api/hooks/useWriteContract#data
      */
      v = resetTransaction(v)
    }

    setTransactionMap(new Map(transactionMap.set(k, v)))
  }

  function getTransaction(id: string) {
    return transactionMap.get(id)
  }

  function resetTransactionState() {
    setTransactionMap(new Map())
  }

  return {
    getTransaction,
    updateTransaction,
    resetTransactionState,
  }
}

export type TransactionStateResponse = ReturnType<typeof _useTransactionState>
export const TransactionStateContext = createContext<TransactionStateResponse | null>(null)

export function TransactionStateProvider({ children }: PropsWithChildren) {
  const hook = _useTransactionState()

  return (
    <TransactionStateContext.Provider value={hook}>{children}</TransactionStateContext.Provider>
  )
}

export const useTransactionState = (): TransactionStateResponse =>
  useMandatoryContext(TransactionStateContext, 'TransactionState')

function resetTransaction(v: ManagedResult) {
  // Resetting the execution transaction does not immediately reset execution and result statuses so we need to reset them manually
  v.execution.status = 'pending'
  v.result = { status: 'pending', isSuccess: false, data: undefined } as TransactionResult
  v.execution.reset()
  return v
}
