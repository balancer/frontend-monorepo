'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useState } from 'react'
import { wagmiAdapter } from './WagmiSetup'

export type UseWagmiSetupResult = ReturnType<typeof _useWagmiSetup>
export const WagmiSetupContext = createContext<UseWagmiSetupResult | null>(null)

export function _useWagmiSetup() {
  const [wagmiSetup, setWagmiSetup] = useState(wagmiAdapter)

  return { wagmiSetup, setWagmiSetup }
}

/*
  Provider to store the wagmi config inside a react state so that it can be overridden to impersonate accounts
  Useful for manual and E2E testing
*/
export function WagmiSetupProvider({ children }: PropsWithChildren) {
  const config = _useWagmiSetup()

  return <WagmiSetupContext.Provider value={config}>{children}</WagmiSetupContext.Provider>
}

export const useWagmiSetup = (): UseWagmiSetupResult =>
  useMandatoryContext(WagmiSetupContext, 'WagmiSetup')
