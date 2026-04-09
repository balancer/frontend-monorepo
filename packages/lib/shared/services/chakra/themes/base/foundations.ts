import { type ThemeConfig } from '@chakra-ui/react'

export const DEFAULT_THEME_COLOR_MODE = 'dark'

// Cannot me named config to avoid deprecation error in turbopack mode
export const themeConfig: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const fonts = {
  heading: `inherit`,
  body: `inherit`,
}

export const styles = {
  global: {
    html: {
      scrollBehavior: 'smooth',
      overscrollBehaviorY: 'none',
    },
    'body > div[data-rk]': {
      minHeight: '100vh',
    },
    body: {
      background: 'background.base',
    },
    '::-webkit-scrollbar': {
      width: '10px',
    },
    '.chakra-ui-light ::-webkit-scrollbar, .chakra-ui-dark ::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
    },
    '::-webkit-scrollbar-thumb': {
      boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease-in-out',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '16px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    '.chakra-ui-light ::-webkit-scrollbar-thumb, .chakra-ui-dark ::-webkit-scrollbar-thumb': {},
    '.chakra-ui-dark::-webkit-scrollbar-thumb, .chakra-ui-dark ::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    '.chakra-ui-dark::-webkit-scrollbar-thumb:hover, .chakra-ui-dark ::-webkit-scrollbar-thumb:hover':
      {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
      },
    'p + ul': {
      mt: '1',
    },
  },
}
