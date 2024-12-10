import {
  calcMarketPriceImpact,
  getFullPriceImpactLabel,
  getMaxSlippageLabel,
  getPriceImpactLabel,
} from './price-impact.utils'

test('calcMarketPriceImpact', () => {
  expect(calcMarketPriceImpact('0', '0')).toBe('0')
  expect(calcMarketPriceImpact('1', '0')).toBe('0')
  expect(calcMarketPriceImpact('0', '1')).toBe('0')
  expect(calcMarketPriceImpact('1', '1')).toBe('0')

  expect(calcMarketPriceImpact('100', '90')).toBe('0.11111111111111111111') // 11% price impact
  expect(calcMarketPriceImpact('100', '80')).toBe('0.25') // 25% price impact
  expect(calcMarketPriceImpact('100', '110')).toBe('0') // Positive price impacts should be 0%
})

test('getPriceImpactLabel', () => {
  getPriceImpactLabel
  expect(getPriceImpactLabel(undefined)).toBe('')
  expect(getPriceImpactLabel(-1)).toBe(' (-<0.01%)')
  expect(getPriceImpactLabel(0)).toBe('')
  expect(getPriceImpactLabel(0.123)).toBe(' (-12.30%)')
})

test('getFullPriceImpactLabel', () => {
  expect(getFullPriceImpactLabel(undefined, '0')).toBe('-')
  expect(getFullPriceImpactLabel(null, '$0.0')).toBe('-')
  expect(getFullPriceImpactLabel('0', '$0.0')).toBe('$0.0 (0.00%)')
  expect(getFullPriceImpactLabel('0', '$0.00025')).toBe('$0.00025 (0.00%)')
  expect(getFullPriceImpactLabel('0.01', '$0.02')).toBe('-$0.02 (-1.00%)')
  expect(getFullPriceImpactLabel('0.003', '€123.45678')).toBe('-€123.45678 (-0.30%)')
})

test('getMaxSlippageLabel', () => {
  expect(getMaxSlippageLabel(0, '0')).toBe('-')
  expect(getMaxSlippageLabel('-1', '$0.1')).toBe('$0.1 (0.00%)')
  expect(getMaxSlippageLabel('0', '$0.123')).toBe('$0.123 (0.00%)')
  expect(getMaxSlippageLabel('0.01', '$0.02')).toBe('-$0.02 (-0.01%)')
  expect(getMaxSlippageLabel('0.03', '€123.45678')).toBe('-€123.45678 (-0.03%)')
  expect(getMaxSlippageLabel('0.004', '€123.45678')).toBe('-€123.45678 (-<0.01%)')
})
