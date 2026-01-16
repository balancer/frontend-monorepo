import { fNum } from '@repo/lib/shared/utils/numbers'

export function numberFormatUSDValue(value: number | string): string {
  return fNum('fiat', value)
}
