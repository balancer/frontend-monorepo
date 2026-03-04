// Function to create a color with opacity
export const createBackgroundOpacity = (baseColor: string, opacity: number) =>
  `hsla(${baseColor}, ${opacity})`

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
