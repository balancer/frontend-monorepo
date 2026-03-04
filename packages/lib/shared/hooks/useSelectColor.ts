import { useChakraContext } from '@chakra-ui/react'

function resolveTokenVar(system: ReturnType<typeof useChakraContext>, path: string): string {
  const cssVar = system.token.var(`colors.${path}`)
  if (typeof window === 'undefined') return ''
  const varName = cssVar.slice(4, -1) // strip 'var(' and ')'
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

export function useSelectColor() {
  const system = useChakraContext()

  return (element: string, attr: string) => resolveTokenVar(system, `${element}.${attr}`)
}
