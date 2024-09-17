import { useTheme } from 'next-themes'
import { DEFAULT_THEME_COLOR_MODE } from './themes/base/foundations'

export type ColorMode = 'light' | 'dark'

export function useThemeColorMode(): ColorMode {
  const { theme } = useTheme()

  const _theme = theme as ColorMode | undefined

  return _theme || DEFAULT_THEME_COLOR_MODE
}
