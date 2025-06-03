import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { useCreateLbpSteps } from './steps/useCreateLbpSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'

export type UseLbpCreationResponse = ReturnType<typeof useLbpCreationLogic>
const LbpCreationContext = createContext<UseLbpCreationResponse | null>(null)

export function useLbpCreationLogic() {
  const previewModalDisclosure = useDisclosure()

  const { steps, isLoadingSteps } = useCreateLbpSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  // TODO: "lastTransaction" refers to the last step NOT the most recent transaction
  // TODO: figure out how to pass createLbpTxHash (first step) to the useReceipt parser helper
  const initLbpTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    previewModalDisclosure,
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    initLbpTxHash,
    urlTxHash: undefined, // TODO: figure out how to get this?
  }
}

export function LbpCreationProvider({ children }: { children: React.ReactNode }) {
  const hook = useLbpCreationLogic()
  return <LbpCreationContext.Provider value={hook}>{children}</LbpCreationContext.Provider>
}

export const useLbpCreation = (): UseLbpCreationResponse =>
  useMandatoryContext(LbpCreationContext, 'LbpCreation')
