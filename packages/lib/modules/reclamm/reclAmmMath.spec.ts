import {
  computeCenteredness,
  calculateLowerMargin,
  calculateUpperMargin,
  calculateOutGivenIn,
  calculateBalancesAfterSwapIn,
  calculateInvariant,
  recalculateVirtualBalances,
  calculateInitialBalances,
} from './reclAmmMath'

describe('computeCenteredness', () => {
  it('returns zero centeredness when balanceA is 0', () => {
    const result = computeCenteredness({
      balanceA: 0,
      balanceB: 100,
      virtualBalanceA: 500,
      virtualBalanceB: 500,
    })
    expect(result.poolCenteredness).toBe(0)
    expect(result.isPoolAboveCenter).toBe(false)
  })

  it('returns zero centeredness when balanceB is 0', () => {
    const result = computeCenteredness({
      balanceA: 100,
      balanceB: 0,
      virtualBalanceA: 500,
      virtualBalanceB: 500,
    })
    expect(result.poolCenteredness).toBe(0)
    expect(result.isPoolAboveCenter).toBe(true)
  })

  it('returns correct centeredness when pool is above center', () => {
    const result = computeCenteredness({
      balanceA: 100,
      balanceB: 50,
      virtualBalanceA: 500,
      virtualBalanceB: 500,
    })
    expect(result.isPoolAboveCenter).toBe(true)
    expect(result.poolCenteredness).toBeCloseTo(0.5)
  })

  it('returns correct centeredness when pool is below center', () => {
    const result = computeCenteredness({
      balanceA: 50,
      balanceB: 100,
      virtualBalanceA: 500,
      virtualBalanceB: 500,
    })
    expect(result.isPoolAboveCenter).toBe(false)
    expect(result.poolCenteredness).toBeCloseTo(0.5)
  })

  it('returns 1 when balances and virtual balances are proportional', () => {
    const result = computeCenteredness({
      balanceA: 100,
      balanceB: 100,
      virtualBalanceA: 500,
      virtualBalanceB: 500,
    })
    expect(result.poolCenteredness).toBe(1)
    expect(result.isPoolAboveCenter).toBe(true)
  })
})

describe('calculateInvariant', () => {
  it('calculates invariant as product of total balances', () => {
    const result = calculateInvariant({
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result).toBe(600 * 500) // (100 + 500) * (200 + 300)
  })

  it('returns zero when all balances are zero', () => {
    const result = calculateInvariant({
      balanceA: 0,
      balanceB: 0,
      virtualBalanceA: 0,
      virtualBalanceB: 0,
    })
    expect(result).toBe(0)
  })
})

describe('calculateLowerMargin', () => {
  it('calculates lower margin correctly', () => {
    const result = calculateLowerMargin({
      margin: 10,
      invariant: 300000,
      virtualBalanceA: 476,
      virtualBalanceB: 909,
    })
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })
})

describe('calculateUpperMargin', () => {
  it('calculates upper margin correctly', () => {
    const result = calculateUpperMargin({
      margin: 10,
      invariant: 300000,
      virtualBalanceA: 476,
      virtualBalanceB: 909,
    })
    expect(result).toBeGreaterThan(0)
    expect(Number.isFinite(result)).toBe(true)
  })
})

describe('calculateOutGivenIn', () => {
  it('returns 0 when swapAmountIn is 0', () => {
    const result = calculateOutGivenIn({
      swapAmountIn: 0,
      swapTokenIn: 'Token A',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result).toBe(0)
  })

  it('returns 0 when swapAmountIn is falsy', () => {
    const result = calculateOutGivenIn({
      swapAmountIn: null as any,
      swapTokenIn: 'Token A',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result).toBe(0)
  })

  it('calculates output for Token A swap', () => {
    const result = calculateOutGivenIn({
      swapAmountIn: 10,
      swapTokenIn: 'Token A',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(200) // Can't swap more than total balance B
  })

  it('calculates output for Token B swap', () => {
    const result = calculateOutGivenIn({
      swapAmountIn: 10,
      swapTokenIn: 'Token B',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(100) // Can't swap more than total balance A
  })
})

describe('calculateBalancesAfterSwapIn', () => {
  it('updates balances correctly for Token A swap', () => {
    const result = calculateBalancesAfterSwapIn({
      swapAmountIn: 10,
      swapTokenIn: 'Token A',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result.newBalanceA).toBe(110) // 100 + 10
    expect(result.newBalanceB).toBeLessThan(200) // decreases due to swap
  })

  it('updates balances correctly for Token B swap', () => {
    const result = calculateBalancesAfterSwapIn({
      swapAmountIn: 10,
      swapTokenIn: 'Token B',
      balanceA: 100,
      balanceB: 200,
      virtualBalanceA: 500,
      virtualBalanceB: 300,
    })
    expect(result.newBalanceB).toBe(210) // 200 + 10
    expect(result.newBalanceA).toBeLessThan(100) // decreases due to swap
  })
})

describe('recalculateVirtualBalances', () => {
  const baseParams = {
    balanceA: 100,
    balanceB: 100,
    oldVirtualBalanceA: 500,
    oldVirtualBalanceB: 500,
    currentPriceRatio: 1,
    poolParams: {
      margin: 10,
      priceShiftDailyRate: 0.0001,
    },
    updateQ0Params: {
      startTime: 0,
      endTime: 1000,
      startPriceRatio: 1,
      targetPriceRatio: 2,
    },
    simulationParams: {
      simulationSeconds: 500,
      simulationSecondsPerBlock: 1,
      secondsSinceLastInteraction: 100,
    },
  }

  it('returns unchanged values when secondsSinceLastInteraction is very small', () => {
    const params = {
      ...baseParams,
      simulationParams: {
        ...baseParams.simulationParams,
        secondsSinceLastInteraction: 0.001,
      },
    }
    const result = recalculateVirtualBalances(params)
    expect(result.newVirtualBalances.virtualBalanceA).toBe(500)
    expect(result.newVirtualBalances.virtualBalanceB).toBe(500)
    expect(result.newPriceRatio).toBe(1)
  })

  it('updates price ratio when in update window', () => {
    const result = recalculateVirtualBalances(baseParams)
    expect(result.newPriceRatio).toBeGreaterThan(1)
    expect(result.newPriceRatio).toBeLessThan(2)
  })

  it('returns valid virtual balances', () => {
    const result = recalculateVirtualBalances(baseParams)
    expect(Number.isFinite(result.newVirtualBalances.virtualBalanceA)).toBe(true)
    expect(Number.isFinite(result.newVirtualBalances.virtualBalanceB)).toBe(true)
    expect(result.newVirtualBalances.virtualBalanceA).toBeGreaterThan(0)
    expect(result.newVirtualBalances.virtualBalanceB).toBeGreaterThan(0)
  })
})

describe('calculateInitialBalances', () => {
  it('calculates initial balances with valid inputs', () => {
    const result = calculateInitialBalances({
      minPrice: 0.5,
      maxPrice: 2,
      targetPrice: 1,
    })
    expect(result.balanceA).toBe(1000)
    expect(result.balanceB).toBeGreaterThan(0)
    expect(result.virtualBalanceA).toBeGreaterThan(0)
    expect(result.virtualBalanceB).toBeGreaterThan(0)
  })

  it('returns valid balances for edge case prices', () => {
    const result = calculateInitialBalances({
      minPrice: 0.9,
      maxPrice: 1.1,
      targetPrice: 1,
    })
    expect(result.balanceB).toBeGreaterThan(0)
    expect(result.balanceA).toBe(1000)
  })
})
