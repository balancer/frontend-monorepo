'use client'

import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useState } from 'react'
import { Hex } from 'viem'

export function useTransactionStateLogic() {
  /* Globally track whether the `onSuccess` callback has been called for each transaction step.
     This is useful for ensuring that the `onSuccess` callback is not called in every render as it is normally a heavy operation (refetch data, etc.).
   */
  const [onSuccessCalled, setOnSuccessCalled] = useState<{ [txHash: Hex]: boolean }>({})

  function getTransactionHash(step: TransactionStep): Hex | undefined {
    const txHash = step.transaction?.result.data?.transactionHash
    if (!txHash) return
    return txHash
  }

  const updateOnSuccessCalled = (step: TransactionStep, value: boolean) => {
    const txHash = getTransactionHash(step)
    if (!txHash)
      throw new Error(`Transaction hash is required to get transaction hash from step ${step}`)

    setOnSuccessCalled(prevState => ({
      ...prevState,
      [txHash]: value,
    }))
  }

  const isOnSuccessCalled = (step: TransactionStep) => {
    const txHash = getTransactionHash(step)
    if (!txHash) return false
    return !!onSuccessCalled[txHash]
  }

  return {
    updateOnSuccessCalled,
    isOnSuccessCalled,
    setOnSuccessCalled,
  }
}

export type TransactionStateResponse = ReturnType<typeof useTransactionStateLogic>
export const TransactionStateContext = createContext<TransactionStateResponse | null>(null)

export function TransactionStateProvider({ children }: PropsWithChildren) {
  const hook = useTransactionStateLogic()

  return (
    <TransactionStateContext.Provider value={hook}>{children}</TransactionStateContext.Provider>
  )
}

export const useTransactionState = (): TransactionStateResponse =>
  useMandatoryContext(TransactionStateContext, 'TransactionState')
