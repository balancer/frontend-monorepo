import { describe, expect, test } from 'vitest'
import { cleanAmountInput } from './useTokenInput'
import { bn } from '@repo/lib/shared/utils/numbers'

describe('cleanAmountInput', () => {
  test('prefixes a leading decimal separator with zero', () => {
    // Regression: a bare '.' (from typing '.' or ',' as first char) was stored in
    // swapState and crashed the app with '[BigNumber Error] Not a number: .'
    expect(cleanAmountInput('.')).toBe('0.')
    expect(cleanAmountInput(',')).toBe('0.')
    expect(cleanAmountInput('.5')).toBe('0.5')
    expect(cleanAmountInput(',5')).toBe('0.5')
  })

  test('normalizes a comma decimal separator to a dot', () => {
    expect(cleanAmountInput('1,5')).toBe('1.5')
    expect(cleanAmountInput('0,001')).toBe('0.001')
  })

  test('strips non numeric characters', () => {
    expect(cleanAmountInput('abc')).toBe('')
    expect(cleanAmountInput('1a2b3')).toBe('123')
    expect(cleanAmountInput('1e5')).toBe('15')
  })

  test('keeps valid amounts untouched', () => {
    expect(cleanAmountInput('')).toBe('')
    expect(cleanAmountInput('0')).toBe('0')
    expect(cleanAmountInput('0.5')).toBe('0.5')
    expect(cleanAmountInput('1234.5678')).toBe('1234.5678')
  })

  test('every non-empty result is parseable by BigNumber', () => {
    const inputs = ['.', ',', '.5', ',5', '1,5', '0.', '123', 'abc1.2']
    for (const input of inputs) {
      const cleaned = cleanAmountInput(input)
      if (cleaned !== '') expect(bn(cleaned).isNaN()).toBe(false)
    }
  })
})
