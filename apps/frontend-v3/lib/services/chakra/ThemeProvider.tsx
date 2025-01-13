'use client'

import { ChakraProvider, ThemeTypings } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme as balTheme } from './themes/bal/bal.theme'
import { theme as cowTheme } from './themes/cow/cow.theme'
import { useCow } from '@repo/lib/modules/cow/useCow'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isCowPath, isCowVariant } = useCow()

  function getTheme(): ThemeTypings {
    if (isCowPath || isCowVariant) return cowTheme

    return balTheme
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
