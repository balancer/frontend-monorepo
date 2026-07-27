import type { TokenDailyPrices } from '@analytics/lib/hooks/useHodlComparison'
import { computeHodl, type HodlToken, type Sample } from './computeHodl'

const DAY = 86400
const day = (n: number): number => n * DAY

function sample(overrides: Partial<Sample> & { timestamp: number }): Sample {
  return {
    totalLiquidity: 0,
    volume24h: 0,
    fees24h: 0,
    surplus24h: 0,
    sharePrice: 0,
    amounts: [],
    totalShares: 0,
    ...overrides,
  }
}

function series(address: string, prices: Record<number, number>): TokenDailyPrices {
  return { address, daily: new Map(Object.entries(prices).map(([d, p]) => [Number(d), p])) }
}

describe('computeHodl', () => {
  it('values a plain (non-wrapped) pool basket fixed at t0', () => {
    const hodlTokens: HodlToken[] = [
      { wrapped: 'weth', hodl: 'weth' },
      { wrapped: 'usdc', hodl: 'usdc' },
    ]
    const samples: Sample[] = [
      sample({ timestamp: day(0), amounts: [1, 2000], totalShares: 1000 }),
      sample({ timestamp: day(1), amounts: [1, 2000], totalShares: 1000 }),
      sample({ timestamp: day(2), amounts: [1, 2000], totalShares: 1000 }),
    ]
    const priceSeries = [
      series('weth', { [day(0)]: 2000, [day(1)]: 2500, [day(2)]: 1800 }),
      series('usdc', { [day(0)]: 1, [day(1)]: 1, [day(2)]: 1 }),
    ]

    const result = computeHodl(samples, hodlTokens, priceSeries)

    expect(result).not.toBeNull()
    expect(result!.baseIndex).toBe(0)
    // qty per BPT: weth 1/1000 = 0.001, usdc 2000/1000 = 2
    expect(result!.baseValue).toBeCloseTo(0.001 * 2000 + 2 * 1, 10) // 4
    expect(result!.values[0]).toBeCloseTo(4, 10)
    expect(result!.values[1]).toBeCloseTo(0.001 * 2500 + 2 * 1, 10) // 4.5
    expect(result!.values[2]).toBeCloseTo(0.001 * 1800 + 2 * 1, 10) // 3.8
  })

  it('values a boosted (ERC4626) pool in underlying terms, anchored to sharePrice(t0)', () => {
    // Pool holds waWETH (wrapped); HODL basket is valued in WETH (underlying).
    const hodlTokens: HodlToken[] = [{ wrapped: 'waweth', hodl: 'weth' }]
    const samples: Sample[] = [
      sample({ timestamp: day(0), amounts: [10], totalShares: 100, sharePrice: 210 }),
      sample({ timestamp: day(1), amounts: [10], totalShares: 100 }),
    ]
    const priceSeries = [
      // waWETH trades above WETH, reflecting accrued wrapper yield.
      series('waweth', { [day(0)]: 2100, [day(1)]: 2145 }),
      series('weth', { [day(0)]: 2000, [day(1)]: 2200 }),
    ]

    const result = computeHodl(samples, hodlTokens, priceSeries)

    expect(result).not.toBeNull()
    // qty (underlying WETH per BPT) = (10/100) * (2100/2000) = 0.105
    // baseValue = 0.105 * 2000(underlying px at t0) = 210 == sharePrice(t0)
    expect(result!.baseValue).toBeCloseTo(210, 10)
    expect(result!.values[0]).toBeCloseTo(samples[0].sharePrice, 10)
    // Day 1 is valued using only the underlying price (2200), not the wrapper's.
    expect(result!.values[1]).toBeCloseTo(0.105 * 2200, 10) // 231
  })

  it('returns null when a token has no historical price series', () => {
    const hodlTokens: HodlToken[] = [
      { wrapped: 'weth', hodl: 'weth' },
      { wrapped: 'nested-bpt', hodl: 'nested-bpt' },
    ]
    const samples: Sample[] = [sample({ timestamp: day(0), amounts: [1, 1], totalShares: 100 })]
    // Only one of the two tokens has a series — the other (e.g. a nested BPT
    // with no price feed) is missing entirely.
    const priceSeries = [series('weth', { [day(0)]: 2000 })]

    expect(computeHodl(samples, hodlTokens, priceSeries)).toBeNull()
  })

  it('returns null when series is absent or empty, or there are no hodl tokens', () => {
    const hodlTokens: HodlToken[] = [{ wrapped: 'weth', hodl: 'weth' }]
    const samples: Sample[] = [sample({ timestamp: day(0), amounts: [1], totalShares: 100 })]

    expect(computeHodl(samples, hodlTokens, null)).toBeNull()
    expect(computeHodl(samples, hodlTokens, [])).toBeNull()
    expect(computeHodl(samples, [], [series('weth', { [day(0)]: 2000 })])).toBeNull()
  })

  it('walks t0 forward when the pool is younger than the tokens price range', () => {
    const hodlTokens: HodlToken[] = [{ wrapped: 'weth', hodl: 'weth' }]
    const samples: Sample[] = [
      // Day 0-1: malformed amounts (pre-launch snapshots) — must be skipped.
      sample({ timestamp: day(0), amounts: [], totalShares: 0 }),
      sample({ timestamp: day(1), amounts: [1], totalShares: 0 }), // totalShares not > 0
      // Day 2: first well-formed sample — becomes t0.
      sample({ timestamp: day(2), amounts: [1], totalShares: 100 }),
      sample({ timestamp: day(3), amounts: [1], totalShares: 100 }),
    ]
    const priceSeries = [
      series('weth', { [day(0)]: 1900, [day(1)]: 1950, [day(2)]: 2000, [day(3)]: 2100 }),
    ]

    const result = computeHodl(samples, hodlTokens, priceSeries)

    expect(result).not.toBeNull()
    expect(result!.baseIndex).toBe(2)
    expect(result!.values[0]).toBeNull()
    expect(result!.values[1]).toBeNull()
    expect(result!.values[2]).toBeCloseTo((1 / 100) * 2000, 10)
    expect(result!.values[3]).toBeCloseTo((1 / 100) * 2100, 10)
  })

  it('bridges a missing daily price bucket by walking back up to 14 days', () => {
    const hodlTokens: HodlToken[] = [{ wrapped: 'weth', hodl: 'weth' }]
    const samples: Sample[] = [
      sample({ timestamp: day(0), amounts: [1], totalShares: 100 }),
      // Day 1's bucket is missing from the oracle feed (gap) — should resolve
      // to day 0's price rather than going null.
      sample({ timestamp: day(1), amounts: [1], totalShares: 100 }),
    ]
    const priceSeries = [series('weth', { [day(0)]: 2000 })]

    const result = computeHodl(samples, hodlTokens, priceSeries)

    expect(result).not.toBeNull()
    expect(result!.values[1]).toBeCloseTo((1 / 100) * 2000, 10)
  })

  it('returns null when no sample ever has a fully priced basket', () => {
    const hodlTokens: HodlToken[] = [{ wrapped: 'weth', hodl: 'weth' }]
    const samples: Sample[] = [sample({ timestamp: day(100), amounts: [1], totalShares: 100 })]
    // Price history starts long after the sample's day, and the 14-day
    // lookback isn't enough to bridge the gap.
    const priceSeries = [series('weth', { [day(0)]: 2000 })]

    expect(computeHodl(samples, hodlTokens, priceSeries)).toBeNull()
  })
})
