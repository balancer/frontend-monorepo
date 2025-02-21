'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { theme } from './themes/beets/beets.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useTheme } from 'next-themes'
import { useColorMode } from '@chakra-ui/react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()

  // this fixes the 'light' theme which was set incorrectly but stored in localStorage awhile ago
  function SetDarkTheme() {
    const { setTheme } = useTheme()
    const { setColorMode } = useColorMode()

    const theme = 'dark'

    useEffect(() => {
      setTheme(theme)
      setColorMode(theme)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
  }

  // Avoid hydration error in turbopack mode
  if (!isMounted) return null

  return (
    <ChakraProvider
      cssVarsRoot="body"
      theme={theme}
      toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
    >
      <SetDarkTheme />
      {children}
    </ChakraProvider>
  )
}
