'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme } from './themes/beets/beets.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

// Manager shape expected by ChakraProvider colorModeManager (StorageManager may be unexported)
const forcedDarkManager = {
  get: () => 'dark' as const,
  set: () => {},
  type: 'localStorage' as const,
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()

  // Avoid hydration error in turbopack mode
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
