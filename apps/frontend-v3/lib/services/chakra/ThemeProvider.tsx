'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme as balTheme } from './themes/bal/bal.theme'
import { theme as cowTheme } from './themes/cow/cow.theme'
import { useCow } from '@repo/lib/modules/cow/useCow'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { BalToaster } from '@repo/lib/shared/components/toasts/BalToaster'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isCowPath, isCowVariant } = useCow()
  const isMounted = useIsMounted()

  const theme = isCowPath || isCowVariant ? cowTheme : balTheme

  // Avoid hydration error in turbopack mode
  if (!isMounted) return null

  return (
    <ChakraProvider value={theme} cssVarsRoot="body">
      {children}
      <BalToaster />
    </ChakraProvider>
  )
}
