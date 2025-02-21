'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ReactNode, useEffect } from 'react'
import { theme } from './themes/beets/beets.theme'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isMounted = useIsMounted()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'dark')
    }
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
