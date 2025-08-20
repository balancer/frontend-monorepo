import { ZERO_VALUE_DASH, Numberish, isZero } from './numbers'

/**
 * Formats any value for display, showing dash for falsy values (0, '0', '', undefined)
 * @param value - The value to format (string, number, or undefined)
 * @param formatter - Optional formatter function for non-falsy values
 * @param options - Options to pass to the formatter function
 * @returns Formatted display string or dash for falsy values
 */
export function formatFalsyValueAsDash(
  value: Numberish | undefined,
  formatter?: (value: Numberish, options?: any) => string,
  options?: any
): string {
  // Convert to string for falsy checks, default to empty string for undefined
  const stringValue = value?.toString() ?? ''

  // Handle undefined and empty string - always return dash
  if (value === undefined || stringValue === '') {
    return ZERO_VALUE_DASH
  }

  // Handle zero values - respect showZeroAmountAsDash option
  if (isZero(stringValue)) {
    const showZeroAmountAsDash = options?.showZeroAmountAsDash ?? false
    return showZeroAmountAsDash ? ZERO_VALUE_DASH : stringValue
  }

  // If formatter is provided, use it to format the value
  if (formatter && value) {
    return formatter(value, options)
  }

  // Otherwise return the string representation of the value
  return stringValue
}
