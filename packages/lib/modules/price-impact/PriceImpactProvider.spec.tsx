import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePriceImpactLogic } from './PriceImpactProvider'

describe('usePriceImpactLogic', () => {
  it('derives impact metadata from price impact and resets accepted risk when it changes', () => {
    const { result } = renderHook(() => usePriceImpactLogic())

    expect(result.current.priceImpactLevel).toBe('low')
    expect(result.current.priceImpactColor).toBe('grayText')
    expect(result.current.hasToAcceptHighPriceImpact).toBe(false)
    expect(result.current.acceptPriceImpactRisk).toBe(false)

    act(() => {
      result.current.setPriceImpact(0.02)
    })

    expect(result.current.priceImpactLevel).toBe('medium')
    expect(result.current.priceImpactColor).toBe('font.warning')
    expect(result.current.hasToAcceptHighPriceImpact).toBe(false)
    expect(result.current.acceptPriceImpactRisk).toBe(false)

    act(() => {
      result.current.setAcceptPriceImpactRisk(true)
    })

    expect(result.current.acceptPriceImpactRisk).toBe(true)

    act(() => {
      result.current.setPriceImpact(0.06)
    })

    expect(result.current.priceImpactLevel).toBe('high')
    expect(result.current.priceImpactColor).toBe('font.error')
    expect(result.current.hasToAcceptHighPriceImpact).toBe(true)
    expect(result.current.acceptPriceImpactRisk).toBe(false)

    act(() => {
      result.current.resetPriceImpact()
    })

    expect(result.current.priceImpact).toBeUndefined()
    expect(result.current.priceImpactLevel).toBe('low')
    expect(result.current.priceImpactColor).toBe('grayText')
    expect(result.current.hasToAcceptHighPriceImpact).toBe(false)
  })
})
