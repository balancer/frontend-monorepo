import { useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'

export function useSelectColor() {
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()

  return (element: string, attr: string) =>
    nextTheme === 'dark'
      ? theme.semanticTokens.colors[element][attr]._dark
      : theme.semanticTokens.colors[element][attr].default
}
