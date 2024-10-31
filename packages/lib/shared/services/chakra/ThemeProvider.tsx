'use client'

import { ChakraProvider, ThemeTypings } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme as balTheme } from './themes/bal/bal.theme'
import { theme as cowTheme } from './themes/cow/cow.theme'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { useCow } from '@repo/lib/modules/cow/useCow'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { projectName } = getProjectConfig()
  const { isCowPath, isCowVariant } = useCow()

  function getDefaultTheme() {
    switch (projectName) {
      case 'Balancer':
        return balTheme
      default:
        return balTheme
    }
  }
  const defaultTheme = getDefaultTheme()

  function getTheme(): ThemeTypings {
    if (isCowPath || isCowVariant) return cowTheme

    return defaultTheme
  }

  return (
    <ChakraProvider
      cssVarsRoot="body"
      theme={getTheme()}
      toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
    >
      {children}
    </ChakraProvider>
  )
}
