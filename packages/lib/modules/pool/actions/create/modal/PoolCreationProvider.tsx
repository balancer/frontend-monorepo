import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { usePoolCreationSteps } from './usePoolCreationSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { isHash } from 'viem'
import { useParams } from 'next/navigation'

export type UsePoolCreationResponse = ReturnType<typeof usePoolCreationLogic>
const PoolCreationContext = createContext<UsePoolCreationResponse | null>(null)

export function usePoolCreationLogic() {
  const { steps, isLoadingSteps } = usePoolCreationSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const initPoolTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash
  const { txHash } = useParams<{ txHash: string }>()

  return {
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    initPoolTxHash,
    urlTxHash: isHash(txHash) ? txHash : undefined,
  }
}

export function PoolCreationProvider({ children }: PropsWithChildren) {
  const hook = usePoolCreationLogic()
  return <PoolCreationContext.Provider value={hook}>{children}</PoolCreationContext.Provider>
}

export const usePoolCreation = (): UsePoolCreationResponse =>
  useMandatoryContext(PoolCreationContext, 'PoolCreation')
