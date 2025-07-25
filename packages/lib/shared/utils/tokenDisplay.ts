import { size } from 'lodash'
import { isZero, ZERO_VALUE_DASH } from './numbers'

/**
 * Formats a token amount for display, showing dash for zero values when enabled
 * @param amount - The formatted token amount string
 * @param showZeroAmountAsDash - Whether to show dash for zero amounts
 * @returns Formatted display string
 */
export function formatTokenAmount(amount: string, showZeroAmountAsDash: boolean = false): string {
  if ((isZero(amount) && showZeroAmountAsDash) || !amount) {
    return ZERO_VALUE_DASH
  }
  if (size(amount) === 0 && showZeroAmountAsDash) {
    return ZERO_VALUE_DASH
  }

  return amount
}

/**
 * Formats a USD value for display, showing dash for zero values when enabled
 * @param usdValue - The USD value string
 * @param showZeroAmountAsDash - Whether to show dash for zero amounts
 * @param formatCurrency - Function to format the currency value
 * @param options - Options to pass to the currency formatter
 * @returns Formatted display string
 */
export function formatUsdValue(
  usdValue: string | undefined,
  showZeroAmountAsDash: boolean = false,
  formatCurrency: (value: string, options?: any) => string,
  options?: any
): string {
  if (showZeroAmountAsDash && usdValue && isZero(usdValue)) {
    return ZERO_VALUE_DASH
  }
  if (size(usdValue) === 0 && showZeroAmountAsDash) {
    return ZERO_VALUE_DASH
  }
  return formatCurrency(usdValue ?? '0', options)
}
