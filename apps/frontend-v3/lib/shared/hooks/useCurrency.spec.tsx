import { testHook } from '@/test/utils/custom-renderers'
import { useCurrency } from './useCurrency'

import { PropsWithChildren } from 'react'
import { FxRatesContext } from './FxRatesProvider'

export function MockFiatFxRatesProvider({ children }: PropsWithChildren) {
  const hook = {
    hasFxRates: false,
    getFxRate: () => 1, // mock that always return 1 as Fx rate
  }
  return <FxRatesContext.Provider value={hook}>{children}</FxRatesContext.Provider>
}

function testUseCurrency() {
  const { result } = testHook(() => useCurrency(), { wrapper: MockFiatFxRatesProvider })
  return result
}

describe('toCurrency', () => {
  const result = testUseCurrency()

  test('with not small amount', () => {
    expect(result.current.toCurrency('1.23456789')).toBe('$1.23')
    expect(result.current.toCurrency('0.01')).toBe('$0.01')
  })

  test('with small amount', () => {
    expect(result.current.toCurrency('0.001')).toBe('$0.001')
    expect(result.current.toCurrency('0.001234')).toBe('$0.001')
    expect(result.current.toCurrency('0.002344')).toBe('$0.002')
    expect(result.current.toCurrency('0.0019')).toBe('$0.002')
    expect(result.current.toCurrency('0.000001234')).toBe('<$0.001')
  })

  test('not abbreviated', () => {
    expect(result.current.toCurrency('0.001', { abbreviated: false })).toBe('$0.001')
    expect(result.current.toCurrency('56789.12345678', { abbreviated: false })).toBe('$56,789.12')
  })
})

test('formatCurrency', () => {
  const result = testUseCurrency()

  expect(result.current.formatCurrency('1.23456789')).toBe('$1.23456789')
  expect(result.current.formatCurrency('0.01')).toBe('$0.01')
  expect(result.current.formatCurrency('0.001')).toBe('$0.001')
  expect(result.current.formatCurrency('0.000001234')).toBe('$0.000001234')
})
test('formatCurrency', () => {
  const result = testUseCurrency()

  expect(result.current.parseCurrency('0')).toBe('0')
  expect(result.current.parseCurrency('1.23456789')).toBe('1.23456789')
  expect(result.current.parseCurrency('$1.23456789')).toBe('1.23456789')
  expect(result.current.parseCurrency('0.000001234')).toBe('0.000001234')
})
