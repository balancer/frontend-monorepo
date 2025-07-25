import { describe, it, expect, vi } from 'vitest'
import { formatTokenAmount, formatUsdValue } from './tokenDisplay'
import { ZERO_VALUE_DASH } from './numbers'

describe('tokenDisplay utilities', () => {
  describe('formatTokenAmount', () => {
    describe('when showZeroAmountAsDash is false', () => {
      it('should return the amount as-is for non-zero values', () => {
        expect(formatTokenAmount('100.5', false)).toBe('100.5')
        expect(formatTokenAmount('0.001', false)).toBe('0.001')
        expect(formatTokenAmount('1000000', false)).toBe('1000000')
      })

      it('should return the value as-is for zero values (preserving format)', () => {
        expect(formatTokenAmount('0', false)).toBe('0')
        expect(formatTokenAmount('0.0', false)).toBe('0.0')
        expect(formatTokenAmount('0.00', false)).toBe('0.00')
      })

      it('should return empty string for empty values', () => {
        expect(formatTokenAmount('', false)).toBe('')
      })
    })

    describe('when showZeroAmountAsDash is true', () => {
      it('should return dash for zero values', () => {
        expect(formatTokenAmount('0', true)).toBe(ZERO_VALUE_DASH)
        expect(formatTokenAmount('0.0', true)).toBe(ZERO_VALUE_DASH)
        expect(formatTokenAmount('0.00', true)).toBe(ZERO_VALUE_DASH)
      })

      it('should return the amount as-is for non-zero values', () => {
        expect(formatTokenAmount('100.5', true)).toBe('100.5')
        expect(formatTokenAmount('0.001', true)).toBe('0.001')
        expect(formatTokenAmount('1000000', true)).toBe('1000000')
      })

      it('should return empty string as-is (not treated as zero)', () => {
        expect(formatTokenAmount('', true)).toBe('')
      })
    })

    describe('edge cases', () => {
      it('should handle negative values correctly', () => {
        expect(formatTokenAmount('-100', false)).toBe('-100')
        expect(formatTokenAmount('-100', true)).toBe('-100')
      })

      it('should handle very small positive values', () => {
        expect(formatTokenAmount('0.0001', false)).toBe('0.0001')
        expect(formatTokenAmount('0.0001', true)).toBe('0.0001')
      })
    })
  })

  describe('formatUsdValue', () => {
    const mockFormatCurrency = vi.fn()

    beforeEach(() => {
      mockFormatCurrency.mockClear()
    })

    describe('when showZeroAmountAsDash is false', () => {
      it('should call formatCurrency for all values', () => {
        mockFormatCurrency.mockReturnValue('$100.00')

        const result = formatUsdValue('100', false, mockFormatCurrency, { abbreviated: true })

        expect(result).toBe('$100.00')
        expect(mockFormatCurrency).toHaveBeenCalledWith('100', { abbreviated: true })
      })

      it('should call formatCurrency with "0" for undefined values', () => {
        mockFormatCurrency.mockReturnValue('$0.00')

        const result = formatUsdValue(undefined, false, mockFormatCurrency)

        expect(result).toBe('$0.00')
        expect(mockFormatCurrency).toHaveBeenCalledWith('0', undefined)
      })

      it('should call formatCurrency for zero values', () => {
        mockFormatCurrency.mockReturnValue('$0.00')

        const result = formatUsdValue('0', false, mockFormatCurrency)

        expect(result).toBe('$0.00')
        expect(mockFormatCurrency).toHaveBeenCalledWith('0', undefined)
      })
    })

    describe('when showZeroAmountAsDash is true', () => {
      it('should return dash for zero USD values', () => {
        const result = formatUsdValue('0', true, mockFormatCurrency)

        expect(result).toBe(ZERO_VALUE_DASH)
        expect(mockFormatCurrency).not.toHaveBeenCalled()
      })

      it('should return dash for zero decimal USD values', () => {
        const result = formatUsdValue('0.0', true, mockFormatCurrency)

        expect(result).toBe(ZERO_VALUE_DASH)
        expect(mockFormatCurrency).not.toHaveBeenCalled()
      })

      it('should call formatCurrency for non-zero values', () => {
        mockFormatCurrency.mockReturnValue('$100.00')

        const result = formatUsdValue('100', true, mockFormatCurrency, { abbreviated: true })

        expect(result).toBe('$100.00')
        expect(mockFormatCurrency).toHaveBeenCalledWith('100', { abbreviated: true })
      })

      it('should return dash for undefined values (treated as zero)', () => {
        const result = formatUsdValue(undefined, true, mockFormatCurrency)

        expect(result).toBe(ZERO_VALUE_DASH)
        expect(mockFormatCurrency).not.toHaveBeenCalled()
      })

      it('should call formatCurrency for very small positive values', () => {
        mockFormatCurrency.mockReturnValue('<$0.001')

        const result = formatUsdValue('0.0001', true, mockFormatCurrency)

        expect(result).toBe('<$0.001')
        expect(mockFormatCurrency).toHaveBeenCalledWith('0.0001', undefined)
      })
    })

    describe('edge cases', () => {
      it('should handle negative USD values correctly', () => {
        mockFormatCurrency.mockReturnValue('-$100.00')

        const result = formatUsdValue('-100', true, mockFormatCurrency)

        expect(result).toBe('-$100.00')
        expect(mockFormatCurrency).toHaveBeenCalledWith('-100', undefined)
      })

      it('should pass through options to formatCurrency', () => {
        mockFormatCurrency.mockReturnValue('$1K')
        const options = { abbreviated: true, withSymbol: false }

        formatUsdValue('1000', false, mockFormatCurrency, options)

        expect(mockFormatCurrency).toHaveBeenCalledWith('1000', options)
      })
    })
  })
})
