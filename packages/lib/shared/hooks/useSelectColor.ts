/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useTheme: Use Import from system or use useChakraContext

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import { useTheme as useNextTheme } from 'next-themes';

export function useSelectColor() {
  const theme = useChakraTheme()
  const { system: nextTheme } = useNextTheme()

  return (element: string, attr: string) =>
    nextTheme === 'dark'
      ? theme.token('semanticTokens.colors')[element][attr]._dark
      : theme.token('semanticTokens.colors')[element][attr].default;
}
