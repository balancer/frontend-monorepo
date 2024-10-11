'use client'

import { SignatureState } from '@/lib/modules/web3/signatures/signature.helpers'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { Permit2 } from '@balancer/sdk'
import { PropsWithChildren, createContext, useState } from 'react'

export type UsePermit2SignatureResponse = ReturnType<typeof _usePermit2Signature>
export const Permit2SignatureContext = createContext<UsePermit2SignatureResponse | null>(null)

export function _usePermit2Signature() {
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
  const hook = _usePermit2Signature()
  return (
    <Permit2SignatureContext.Provider value={hook}>{children}</Permit2SignatureContext.Provider>
  )
}

export const usePermit2Signature = (): UsePermit2SignatureResponse =>
  useMandatoryContext(Permit2SignatureContext, 'Permit2Signature')
