import { describe, expect, test } from 'vitest'
import { calculatePriceBounds } from './useAutoRangeConfigurationOptions'

describe('calculatePriceBounds', () => {
  test('clears derived bounds when a numeric draft is incomplete', () => {
    expect(calculatePriceBounds('.', '50')).toEqual({ initialMinPrice: '', initialMaxPrice: '' })
    expect(calculatePriceBounds('1', '.')).toEqual({ initialMinPrice: '', initialMaxPrice: '' })
  })
})
