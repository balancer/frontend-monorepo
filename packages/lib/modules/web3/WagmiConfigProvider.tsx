'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren, useState } from 'react'
import { wagmiConfig as _wagmiConfig } from './WagmiConfig'

export type UseWagmiConfigResult = ReturnType<typeof useWagmiConfigLogic>
export const WagmiConfigContext = createContext<UseWagmiConfigResult | null>(null)

export function useWagmiConfigLogic() {
  const [wagmiConfig, setWagmiConfig] = useState(_wagmiConfig)

  return { wagmiConfig, setWagmiConfig }
}

/*
  Provider to store the wagmi config inside a react state so that it can be overridden to impersonate accounts
  Useful for manual and E2E testing
*/
export function WagmiConfigProvider({ children }: PropsWithChildren) {
  const config = useWagmiConfigLogic()

  return <WagmiConfigContext.Provider value={config}>{children}</WagmiConfigContext.Provider>
}

export const useWagmiConfig = (): UseWagmiConfigResult =>
  useMandatoryContext(WagmiConfigContext, 'WagmiConfig')
