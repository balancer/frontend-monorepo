/**
 * String Converter to convert snake_case to Title Case
 * Eg.
 * - quick_brown_fox -> Quick Brown Fox
 * - quick_brown____fox -> Quick Brown Fox
 * - quick_brown_fox----jumps_over -> Quick Brown Fox Jumps Over
 *
 */

export const convertSnakeToTitleCase = (s: string): string =>
  s
    .toLowerCase()
    .replace(/^[-_]*(.)/, (_, c: string) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c: string) => ' ' + c.toUpperCase())

export function arrayToSentence(arr: string[]): string {
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return arr.join(' and ')

  const lastElement = arr.pop()
  return arr.join(', ') + ', and ' + lastElement
}
