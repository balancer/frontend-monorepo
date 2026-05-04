import { calculateOutGivenIn, calculateInvariant } from './weightedMath'

describe('calculateInvariant', () => {
  it('calculates invariant for equal weights', () => {
    const result = calculateInvariant({
      balances: [100, 100],
      weights: [0.5, 0.5],
    })
    // 100^0.5 * 100^0.5 = 10 * 10 = 100
    expect(result).toBe(100)
  })

  it('calculates invariant for different balances and weights', () => {
    const result = calculateInvariant({
      balances: [200, 50],
      weights: [0.8, 0.2],
    })
    // 200^0.8 * 50^0.2
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('handles zero balances', () => {
    const result = calculateInvariant({
      balances: [0, 100],
      weights: [0.5, 0.5],
    })
    expect(result).toBe(0)
  })

  it('handles three tokens', () => {
    const result = calculateInvariant({
      balances: [100, 200, 300],
      weights: [0.4, 0.3, 0.3],
    })
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })
})

describe('calculateOutGivenIn', () => {
  it('returns 0 when swapAmountIn is 0', () => {
    const result = calculateOutGivenIn({
      balances: [100, 100],
      weights: [0.5, 0.5],
      swapAmountIn: 0,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })
    expect(result).toBe(0)
  })

  it('returns 0 when tokenInIndex equals tokenOutIndex', () => {
    const result = calculateOutGivenIn({
      balances: [100, 100],
      weights: [0.5, 0.5],
      swapAmountIn: 10,
      tokenInIndex: 0,
      tokenOutIndex: 0,
    })
    expect(result).toBe(0)
  })

  it('calculates output for simple swap', () => {
    const result = calculateOutGivenIn({
      balances: [100, 100],
      weights: [0.5, 0.5],
      swapAmountIn: 10,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(100)
  })

  it('calculates correct output for larger swap', () => {
    const result = calculateOutGivenIn({
      balances: [1000, 1000],
      weights: [0.5, 0.5],
      swapAmountIn: 100,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })
    expect(result).toBeGreaterThan(80)
    expect(result).toBeLessThan(100)
  })

  it('handles three tokens correctly', () => {
    const result = calculateOutGivenIn({
      balances: [100, 200, 300],
      weights: [0.4, 0.3, 0.3],
      swapAmountIn: 10,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })

  it('calculates correctly with different pool sizes', () => {
    const result1 = calculateOutGivenIn({
      balances: [100, 100],
      weights: [0.5, 0.5],
      swapAmountIn: 10,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })

    const result2 = calculateOutGivenIn({
      balances: [1000, 1000],
      weights: [0.5, 0.5],
      swapAmountIn: 10,
      tokenInIndex: 0,
      tokenOutIndex: 1,
    })

    expect(result2).toBeGreaterThan(result1)
  })
})
