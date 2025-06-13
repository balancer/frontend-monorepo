import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { useDisclosure } from '@chakra-ui/react'
import { useCreateLbpSteps } from './steps/useCreateLbpSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { Hash } from 'viem'

export type UseLbpCreationResponse = ReturnType<typeof useLbpCreationLogic>
const LbpCreationContext = createContext<UseLbpCreationResponse | null>(null)

export function useLbpCreationLogic(urlTxHash?: Hash) {
  const previewModalDisclosure = useDisclosure()

  const { steps, isLoadingSteps } = useCreateLbpSteps()
  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const initLbpTxHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    previewModalDisclosure,
    transactionSteps,
    lastTransaction: transactionSteps.lastTransaction,
    initLbpTxHash,
    urlTxHash,
  }
}

type Props = PropsWithChildren<{
  urlTxHash?: Hash
}>

export function LbpCreationProvider({ urlTxHash, children }: Props) {
  const hook = useLbpCreationLogic(urlTxHash)
  return <LbpCreationContext.Provider value={hook}>{children}</LbpCreationContext.Provider>
}

export const useLbpCreation = (): UseLbpCreationResponse =>
  useMandatoryContext(LbpCreationContext, 'LbpCreation')
