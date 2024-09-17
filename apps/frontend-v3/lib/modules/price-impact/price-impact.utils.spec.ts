import { calcMarketPriceImpact } from './price-impact.utils'

test('calcMarketPriceImpact', () => {
  expect(calcMarketPriceImpact('0', '0')).toBe('0')
  expect(calcMarketPriceImpact('1', '0')).toBe('0')
  expect(calcMarketPriceImpact('0', '1')).toBe('0')
  expect(calcMarketPriceImpact('1', '1')).toBe('0')

  expect(calcMarketPriceImpact('100', '90')).toBe('0.11111111111111111111') // 11% price impact
  expect(calcMarketPriceImpact('100', '80')).toBe('0.25') // 25% price impact
  expect(calcMarketPriceImpact('100', '110')).toBe('0') // Positive price impacts should be 0%
})
