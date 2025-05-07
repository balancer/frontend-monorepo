/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import { createContext, PropsWithChildren, useCallback, useState } from 'react'
import { ManagedResult } from './lib'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { resetTransaction } from './transaction.helper'

export function _useTransactionState() {
  const [transactionMap, setTransactionMap] = useState<Map<string, ManagedResult>>(new Map())

  function updateTransaction(k: string, v: ManagedResult) {
    // if creating transaction
    if (!transactionMap.has(k)) {
      // Safe App edge case when the transaction is created with success status
      if (v.result.status === 'success') {
        setTransactionMap(new Map(transactionMap.set(k, v)))
      } else {
        /*
      When there was a previous transaction useWriteContract() will return the execution hash from that previous transaction,
      So we need to reset it to avoid issues with multiple "managedTransaction" steps running in sequence.
      More info: https://wagmi.sh/react/api/hooks/useWriteContract#data
      */
        v = resetTransaction(v)
      }
    }

    // Avoid updating transaction if it's already successful (avoids unnecessary re-renders and side-effects)
    if (getTransaction(k)?.result.status === 'success') return
    setTransactionMap(new Map(transactionMap.set(k, v)))
  }

  const getTransaction = useCallback(
    (id: string) => {
      return transactionMap.get(id)
    },
    [transactionMap]
  )

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
