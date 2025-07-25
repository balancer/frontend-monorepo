import { fNum, ZERO_VALUE_DASH, isZero } from './numbers'
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
  return isZero(raw) ? ZERO_VALUE_DASH : fNum(format, raw, opts)
}
