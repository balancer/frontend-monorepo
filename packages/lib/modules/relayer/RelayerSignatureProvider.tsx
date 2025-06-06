'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'

import { Address } from 'viem'
import { SignatureState } from '../web3/signatures/signature.helpers'

export type UseRelayerSignatureResponse = ReturnType<typeof useRelayerSignatureLogic>
export const RelayerSignatureContext = createContext<UseRelayerSignatureResponse | null>(null)

export function useRelayerSignatureLogic() {
  const [relayerApprovalSignature, setRelayerApprovalSignature] = useState<Address | undefined>()

  const [signRelayerState, setSignRelayerState] = useState<SignatureState>(SignatureState.Preparing)

  return {
    relayerApprovalSignature,
    setRelayerApprovalSignature,
    signRelayerState,
    setSignRelayerState,
  }
}

export function RelayerSignatureProvider({ children }: PropsWithChildren) {
  const hook = useRelayerSignatureLogic()
  return (
    <RelayerSignatureContext.Provider value={hook}>{children}</RelayerSignatureContext.Provider>
  )
}

export const useRelayerSignature = (): UseRelayerSignatureResponse =>
  useMandatoryContext(RelayerSignatureContext, 'RelayerSignature')
