'use client'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { theme } from './themes/beets/beets.theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode="dark" />
      <ChakraProvider
        cssVarsRoot="body"
        theme={theme}
        toastOptions={{ defaultOptions: { position: 'bottom-left' } }}
      >
        {children}
      </ChakraProvider>
    </>
  )
}
