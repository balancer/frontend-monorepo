export type ColorMode = 'light' | 'dark'

export function useThemeColorMode(): ColorMode {
  return 'dark'
}

export function useIsDarkMode() {
  return true
}
