'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme } from './themes/analytics/analytics.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

const forcedDarkManager = {
  get: () => 'dark' as const,
  set: () => {},
  type: 'localStorage' as const,
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <ChakraProvider
      colorModeManager={forcedDarkManager}
      cssVarsRoot="body"
      theme={theme}
      toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
    >
      {children}
    </ChakraProvider>
  )
}
