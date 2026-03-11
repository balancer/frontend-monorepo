import { useChakraContext } from '@chakra-ui/react'

// Function to create a color with opacity
export const createBackgroundOpacity = (baseColor: string, opacity: number) =>
  `hsla(${baseColor}, ${opacity})`

/**
 * Resolves a Chakra token path to its actual CSS value at runtime.
 * Handles both CSS variable references (var(--chakra-...)) and raw values.
 * Used for passing token values to third-party renderers like echarts that need raw colors.
 */
export function resolveChakraToken(
  system: ReturnType<typeof useChakraContext>,
  category: 'colors' | 'shadows',
  path: string
): string {
  const cssVar = system.token.var(`${category}.${path}`)
  if (!cssVar) return ''
  if (!cssVar.startsWith('var(')) return cssVar // already a raw value
  if (typeof window === 'undefined') return ''
  const varName = cssVar.slice(4, -1) // strip 'var(' and ')'
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

/**
 * Recursively wraps all leaf values in `{ value: string }` for Chakra v3 raw token format.
 * Used for the color palette passed to `theme.tokens.colors`.
 */
export function wrapTokenValues(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value === null || value === undefined || typeof value !== 'object') {
        return [key, { value: String(value ?? '') }]
      }
      return [key, wrapTokenValues(value)]
    })
  )
}
