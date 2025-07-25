import { describe, it, expect } from 'vitest'
import { formatBalanceDisplay } from './formatBalanceDisplay'
import { ZERO_VALUE_DASH } from './numbers'

describe('formatBalanceDisplay', () => {
  describe('zero values should return dash', () => {
    it('should return dash for all zero formats', () => {
      expect(formatBalanceDisplay(0)).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(0n)).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(-0)).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0')).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0.0')).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0.00')).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0.000')).toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for zero regardless of options', () => {
      expect(formatBalanceDisplay(0, 'fiat', { abbreviated: false })).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(0, 'token')).toBe(ZERO_VALUE_DASH)
    })
  })

  describe('non-zero values should use normal formatting', () => {
    it('should format various non-zero values normally', () => {
      expect(formatBalanceDisplay(100)).not.toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(0.5)).not.toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(0.001)).not.toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(-100)).not.toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay(1000000)).not.toBe(ZERO_VALUE_DASH)
    })

    it('should respect format parameter', () => {
      const fiatResult = formatBalanceDisplay(100, 'fiat')
      const tokenResult = formatBalanceDisplay(100, 'token')
      const defaultResult = formatBalanceDisplay(100)

      expect(defaultResult).toBe(fiatResult) // defaults to fiat
      expect(tokenResult).not.toBe(ZERO_VALUE_DASH)
    })

    it('should pass through options to fNum', () => {
      const result = formatBalanceDisplay(100, 'fiat', { abbreviated: false })
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })
  })
})
