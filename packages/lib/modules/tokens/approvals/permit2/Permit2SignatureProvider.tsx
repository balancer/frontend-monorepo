'use client'

import { SignatureState } from '@repo/lib/modules/web3/signatures/signature.helpers'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { Permit2 } from '@balancer/sdk'
import { PropsWithChildren, createContext, useState } from 'react'

export type UsePermit2SignatureResponse = ReturnType<typeof usePermit2SignatureLogic>
export const Permit2SignatureContext = createContext<UsePermit2SignatureResponse | null>(null)

export function usePermit2SignatureLogic() {
  const [permit2Signature, setPermit2Signature] = useState<Permit2 | undefined>()

  const [signPermit2State, setSignPermit2State] = useState<SignatureState>(SignatureState.Preparing)

  return {
    permit2Signature,
    setPermit2Signature,
    signPermit2State,
    setSignPermit2State,
  }
}

export function Permit2SignatureProvider({ children }: PropsWithChildren) {
  const hook = usePermit2SignatureLogic()
  return (
    <Permit2SignatureContext.Provider value={hook}>{children}</Permit2SignatureContext.Provider>
  )
}

export const usePermit2Signature = (): UsePermit2SignatureResponse =>
  useMandatoryContext(Permit2SignatureContext, 'Permit2Signature')
