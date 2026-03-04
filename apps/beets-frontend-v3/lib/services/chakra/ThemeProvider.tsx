'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { theme } from './themes/beets/beets.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useTheme } from 'next-themes'
import { BalToaster } from '@repo/lib/shared/components/toasts/BalToaster'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()

  // this fixes the 'light' theme which was set incorrectly but stored in localStorage awhile ago
  function SetDarkTheme() {
    const { setTheme } = useTheme()

    const darkTheme = 'dark'

    useEffect(() => {
      setTheme(darkTheme)
    }, [])

    return null
  }

  // Avoid hydration error in turbopack mode
  if (!isMounted) return null

  return (
    <ChakraProvider value={theme} cssVarsRoot="body">
      <SetDarkTheme />
      {children}
      <BalToaster />
    </ChakraProvider>
  )
}
