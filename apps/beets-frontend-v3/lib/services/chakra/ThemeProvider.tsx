'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { theme } from './themes/beets/beets.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useTheme } from 'next-themes'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()
  const { setTheme } = useTheme()

  // this fixes the theme which was set incorrectly but stored in localStorage awhile ago
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('chakra-ui-color-mode') === 'light') {
        localStorage.setItem('chakra-ui-color-mode', 'dark')
      }

      setTheme('dark')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Avoid hydration error in turbopack mode
  if (!isMounted) return null

  return (
    <ChakraProvider
      cssVarsRoot="body"
      theme={theme}
      toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
    >
      {children}
    </ChakraProvider>
  )
}
