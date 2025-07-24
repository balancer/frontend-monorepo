import { fNum, ZERO_VALUE_DASH } from './numbers'
import type { Numberish } from './numbers'

/**
 * Formats balance display values, showing dash for zero balances
 * instead of numeric zero for better visual hierarchy and scannability.
 *
 * @param raw - The balance value to format (bigint, number, or string)
 * @param format - The number format type (defaults to 'fiat')
 * @param opts - Optional formatting options passed to fNum
 * @returns Formatted string with dash for zero values
 */
export function formatBalanceDisplay(
  raw: Numberish,
  format: 'fiat' | 'token' = 'fiat',
  opts?: Parameters<typeof fNum>[2]
): string {
  // Convert to string first to handle all input types consistently
  const stringValue = raw.toString()

  // Check if the value is exactly zero
  // Handle bigint, number, and string representations of zero
  if (
    raw === 0 ||
    raw === 0n ||
    stringValue === '0' ||
    stringValue === '0.0' ||
    stringValue === '0.00' ||
    stringValue === '0.000' ||
    parseFloat(stringValue) === 0
  ) {
    return ZERO_VALUE_DASH
  }

  // For non-zero values, use the existing formatting logic
  return fNum(format, raw, opts)
}
