import { describe, it, expect } from 'vitest'
import { formatBalanceDisplay } from './formatBalanceDisplay'
import { ZERO_VALUE_DASH } from './numbers'

describe('formatBalanceDisplay', () => {
  describe('zero values should return dash', () => {
    it('should return dash for numeric zero', () => {
      expect(formatBalanceDisplay(0)).toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for bigint zero', () => {
      expect(formatBalanceDisplay(0n)).toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for string zero', () => {
      expect(formatBalanceDisplay('0')).toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for decimal zero', () => {
      expect(formatBalanceDisplay('0.0')).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0.00')).toBe(ZERO_VALUE_DASH)
      expect(formatBalanceDisplay('0.000')).toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for negative zero', () => {
      expect(formatBalanceDisplay(-0)).toBe(ZERO_VALUE_DASH)
    })
  })

  describe('non-zero values should use normal formatting', () => {
    it('should format positive numbers normally', () => {
      const result = formatBalanceDisplay(100)
      expect(result).not.toBe(ZERO_VALUE_DASH)
      expect(result).toContain('100')
    })

    it('should format decimal numbers normally', () => {
      const result = formatBalanceDisplay(0.5)
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should format very small positive numbers normally', () => {
      const result = formatBalanceDisplay(0.001)
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should format negative numbers normally', () => {
      const result = formatBalanceDisplay(-100)
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should format large numbers normally', () => {
      const result = formatBalanceDisplay(1000000)
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })
  })

  describe('format parameter', () => {
    it('should accept fiat format', () => {
      const result = formatBalanceDisplay(100, 'fiat')
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should accept token format', () => {
      const result = formatBalanceDisplay(100, 'token')
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should default to fiat format', () => {
      const fiatResult = formatBalanceDisplay(100, 'fiat')
      const defaultResult = formatBalanceDisplay(100)
      expect(defaultResult).toBe(fiatResult)
    })
  })

  describe('options parameter', () => {
    it('should pass through options to fNum for non-zero values', () => {
      const result = formatBalanceDisplay(100, 'fiat', { abbreviated: false })
      expect(result).not.toBe(ZERO_VALUE_DASH)
    })

    it('should return dash for zero regardless of options', () => {
      const result = formatBalanceDisplay(0, 'fiat', { abbreviated: false })
      expect(result).toBe(ZERO_VALUE_DASH)
    })
  })
})
