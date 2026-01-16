import { fNum } from '@repo/lib/shared/utils/numbers'

export function tokenFormatAmount(amount: string | number): string {
  return fNum('token', amount)
}
