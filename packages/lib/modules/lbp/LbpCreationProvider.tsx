import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { useCreateLbpSteps } from './steps/useCreateLbpSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { isHash } from 'viem'
import { useParams } from 'next/navigation'

export type UseLbpCreationResponse = ReturnType<typeof useLbpCreationLogic>
const LbpCreationContext = createContext<UseLbpCreationResponse | null>(null)

export function useLbpCreationLogic() {
  const { steps, isLoadingSteps } = useCreateLbpSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const initLbpTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash
  const { txHash } = useParams<{ txHash: string }>()

  return {
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    initLbpTxHash,
    urlTxHash: isHash(txHash) ? txHash : undefined,
  }
}

export function LbpCreationProvider({ children }: PropsWithChildren) {
  const hook = useLbpCreationLogic()
  return <LbpCreationContext.Provider value={hook}>{children}</LbpCreationContext.Provider>
}

export const useLbpCreation = (): UseLbpCreationResponse =>
  useMandatoryContext(LbpCreationContext, 'LbpCreation')
