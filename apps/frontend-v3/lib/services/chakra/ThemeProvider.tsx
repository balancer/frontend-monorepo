'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme as balTheme } from './themes/bal/bal.theme'
import { theme as cowTheme } from './themes/cow/cow.theme'
import { useCow } from '@repo/lib/modules/cow/useCow'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

// Manager shape expected by ChakraProvider colorModeManager (StorageManager may be unexported)
const forcedDarkManager = {
  get: () => 'dark' as const,
  set: () => {},
  type: 'localStorage' as const,
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isCowPath, isCowVariant } = useCow()
  const isMounted = useIsMounted()

  const theme = isCowPath || isCowVariant ? cowTheme : balTheme

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
