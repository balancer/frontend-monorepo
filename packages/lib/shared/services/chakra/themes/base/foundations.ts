export const DEFAULT_THEME_COLOR_MODE = 'dark'

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
    '.light ::-webkit-scrollbar, .dark ::-webkit-scrollbar': {
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
    '.dark::-webkit-scrollbar-thumb, .dark ::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    '.dark::-webkit-scrollbar-thumb:hover, .dark ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    'p + ul': {
      mt: '1',
    },
  },
}
