import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext } from 'react'
import { useDisclosure } from '@chakra-ui/react'

export type UseLbpCreationResponse = ReturnType<typeof useLbpCreationLogic>
const LbpCreationContext = createContext<UseLbpCreationResponse | null>(null)

export function useLbpCreationLogic() {
  const previewModalDisclosure = useDisclosure()

  return { previewModalDisclosure }
}

export function LbpCreationProvider({ children }: { children: React.ReactNode }) {
  const hook = useLbpCreationLogic()
  return <LbpCreationContext.Provider value={hook}>{children}</LbpCreationContext.Provider>
}

export const useLbpCreation = (): UseLbpCreationResponse =>
  useMandatoryContext(LbpCreationContext, 'LbpCreation')
