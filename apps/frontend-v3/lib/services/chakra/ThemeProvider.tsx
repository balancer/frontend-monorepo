'use client'

import { ChakraProvider, ThemeTypings } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme as balTheme } from './themes/bal/bal.theme'
import { theme as cowTheme } from './themes/cow/cow.theme'
import { useCow } from '@repo/lib/modules/cow/useCow'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isCowPath, isCowVariant } = useCow()
  const isMounted = useIsMounted()

  function getTheme(): ThemeTypings {
    if (isCowPath || isCowVariant) return cowTheme

    return balTheme
  }

  // Avoid hydration error in turbopack mode
  if (!isMounted) return null

  return (
    <ChakraProvider
      cssVarsRoot="body"
      key={isCowPath ? 'cow' : 'bal'}
      theme={getTheme()}
      toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
    >
      {children}
    </ChakraProvider>
  )
}
