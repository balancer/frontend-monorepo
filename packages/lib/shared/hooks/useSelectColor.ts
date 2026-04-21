import { useTheme as useChakraTheme } from '@chakra-ui/react'

export function useSelectColor() {
  const theme = useChakraTheme()

  return (element: string, attr: string) => theme.semanticTokens.colors[element][attr]._dark
}
