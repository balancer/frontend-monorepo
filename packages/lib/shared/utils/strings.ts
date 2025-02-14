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

export function isValidTwitterHandle(handle: string): string | true {
  const regex = /^@[A-Za-z0-9_]{1,15}$/
  return regex.test(handle) ? true : 'Invalid X / Twitter handle'
}

export function isValidTelegramHandle(handle: string | undefined): string | true {
  if (!handle) return true
  const regex = /^@[A-Za-z0-9_]{5,32}$/
  return regex.test(handle) ? true : 'Invalid Telegram handle'
}
