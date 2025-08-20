import { describe, it, expect } from 'vitest'
import { formatFalsyValueAsDash } from './tokenDisplay'
import { ZERO_VALUE_DASH } from './numbers'

describe('formatFalsyValueAsDash', () => {
  it('returns dash for undefined and empty string', () => {
    expect(formatFalsyValueAsDash(undefined)).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash('')).toBe(ZERO_VALUE_DASH)
  })

  it('returns formatted value for non-falsy values', () => {
    expect(formatFalsyValueAsDash('100.5')).toBe('100.5')
    expect(formatFalsyValueAsDash(100.5)).toBe('100.5')
  })

  it('respects showZeroAmountAsDash option', () => {
    expect(formatFalsyValueAsDash('0', undefined, { showZeroAmountAsDash: false })).toBe('0')

    expect(formatFalsyValueAsDash('0', undefined, { showZeroAmountAsDash: true })).toBe(
      ZERO_VALUE_DASH
    )

    expect(formatFalsyValueAsDash(0, undefined, { showZeroAmountAsDash: false })).toBe('0')

    expect(formatFalsyValueAsDash(0, undefined, { showZeroAmountAsDash: true })).toBe(
      ZERO_VALUE_DASH
    )
  })

  it('uses formatter when provided', () => {
    const mockFormatter = (value: any) => `$${value}`
    expect(formatFalsyValueAsDash('100', mockFormatter)).toBe('$100')
  })

  it('handles edge cases correctly', () => {
    expect(formatFalsyValueAsDash('')).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash(undefined)).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash('-100')).toBe('-100')
    expect(formatFalsyValueAsDash('0.123456')).toBe('0.123456')
    expect(formatFalsyValueAsDash('1000000000')).toBe('1000000000')
  })
})
