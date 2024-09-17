import { useThemeColorMode } from '../services/chakra/useThemeColorMode'

export const useSemanticTokenColorMode = () =>
  useThemeColorMode() === 'light' ? 'default' : '_dark'
