'use client'

import { SignatureState } from '@/lib/modules/web3/signatures/signature.helpers'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { Permit } from '@balancer/sdk'
import { PropsWithChildren, createContext, useState } from 'react'

export type UsePermitSignatureResponse = ReturnType<typeof _usePermitSignature>
export const PermitSignatureContext = createContext<UsePermitSignatureResponse | null>(null)

export function _usePermitSignature() {
  const [permitSignature, setPermitSignature] = useState<Permit | undefined>()

  const [signPermitState, setSignPermitState] = useState<SignatureState>(SignatureState.Preparing)

  return {
    permitSignature,
    setPermitSignature,
    signPermitState,
    setSignPermitState,
  }
}

export function PermitSignatureProvider({ children }: PropsWithChildren) {
  const hook = _usePermitSignature()
  return <PermitSignatureContext.Provider value={hook}>{children}</PermitSignatureContext.Provider>
}

export const usePermitSignature = (): UsePermitSignatureResponse =>
  useMandatoryContext(PermitSignatureContext, 'PermitSignature')
