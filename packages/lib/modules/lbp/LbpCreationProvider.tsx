import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { useCreateLbpSteps } from './useCreateLbpSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'

export type UseLbpCreationResponse = ReturnType<typeof useLbpCreationLogic>
const LbpCreationContext = createContext<UseLbpCreationResponse | null>(null)

export function useLbpCreationLogic() {
  const previewModalDisclosure = useDisclosure()

  const { steps, isLoadingSteps } = useCreateLbpSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const createLbpTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    previewModalDisclosure,
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    createLbpTxHash,
    urlTxHash: undefined, // TODO: figure out how to get this?
  }
}

export function LbpCreationProvider({ children }: { children: React.ReactNode }) {
  const hook = useLbpCreationLogic()
  return <LbpCreationContext.Provider value={hook}>{children}</LbpCreationContext.Provider>
}

export const useLbpCreation = (): UseLbpCreationResponse =>
  useMandatoryContext(LbpCreationContext, 'LbpCreation')
