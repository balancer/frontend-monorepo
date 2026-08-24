import { describe, expect, it } from 'vitest'
import { PoolType } from '@balancer/sdk'
import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  COW_AMM_RAW_WEIGHT_20,
  COW_AMM_RAW_WEIGHT_50,
  COW_AMM_RAW_WEIGHT_80,
  WeightedPoolStructure,
} from './constants'
import {
  formatNumber,
  getCowRawWeight,
  getGqlPoolType,
  getMinSwapFeePercentage,
  getPercentFromPrice,
  getSwapFeePercentageOptions,
  isAutoRangePool,
  isBalancerProtocol,
  isCowPool,
  isCowProtocol,
  isCustomWeightedPool,
  isGyroEllipticPool,
  isPoolCreatorEnabled,
  isStablePool,
  isStableSurgePool,
  isWeightedPool,
} from './helpers'

describe('getGqlPoolType', () => {
  it('maps every SDK pool type to its GQL counterpart', () => {
    expect(getGqlPoolType(PoolType.Weighted)).toBe(GqlPoolTypeValues.Weighted)
    expect(getGqlPoolType(PoolType.Stable)).toBe(GqlPoolTypeValues.Stable)
    expect(getGqlPoolType(PoolType.StableSurge)).toBe(GqlPoolTypeValues.Stable)
    expect(getGqlPoolType(PoolType.GyroE)).toBe(GqlPoolTypeValues.GyroE)
    expect(getGqlPoolType(PoolType.ReClamm)).toBe(GqlPoolTypeValues.Reclamm)
    expect(getGqlPoolType(PoolType.CowAmm)).toBe(GqlPoolTypeValues.CowAmm)
  })

  it('throws for unmapped pool types', () => {
    expect(() => getGqlPoolType(undefined as unknown as PoolType)).toThrow(/Invalid pool type/)
  })
})

describe('getSwapFeePercentageOptions', () => {
  it('returns stable fee presets for stable and stable surge pools', () => {
    const expected = [
      { value: '0.01', tip: 'Best for super stable pairs' },
      { value: '0.05', tip: 'Best for stable-ish pairs' },
    ]

    expect(getSwapFeePercentageOptions(PoolType.Stable)).toEqual(expected)
    expect(getSwapFeePercentageOptions(PoolType.StableSurge)).toEqual(expected)
  })

  it('returns weighted fee presets for weighted pools', () => {
    const expected = [
      { value: '0.30', tip: 'Best for most weighted pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ]

    expect(getSwapFeePercentageOptions(PoolType.Weighted)).toEqual(expected)
  })

  it('returns default presets for remaining pool types', () => {
    expect(getSwapFeePercentageOptions(PoolType.GyroE)).toEqual([
      { value: '0.30', tip: 'Best for most Gyro E-CLP pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ])

    expect(getSwapFeePercentageOptions(PoolType.ReClamm)).toEqual([
      { value: '0.30', tip: 'Best for most AutoRange pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ])

    expect(getSwapFeePercentageOptions(PoolType.CowAmm)).toEqual([
      { value: '0.30', tip: 'Best for most AutoRange pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ])
  })
})

describe('getMinSwapFeePercentage', () => {
  it('allows a lower minimum for stable pools', () => {
    expect(getMinSwapFeePercentage(PoolType.Stable)).toBe(0.0001)
    expect(getMinSwapFeePercentage(PoolType.StableSurge)).toBe(0.0001)
    expect(getMinSwapFeePercentage(PoolType.Weighted)).toBe(0.001)
    expect(getMinSwapFeePercentage(PoolType.GyroE)).toBe(0.001)
    expect(getMinSwapFeePercentage(PoolType.ReClamm)).toBe(0.001)
  })
})

describe('getPercentFromPrice', () => {
  it('calculates the percent difference between value and price', () => {
    expect(getPercentFromPrice('110', '100')).toBe('10.00')
    expect(getPercentFromPrice('150', '100')).toBe('50.00')
    expect(getPercentFromPrice('80', '100')).toBe('-20.00')
  })

  it('returns 0.00 for unparseable or zero inputs instead of throwing', () => {
    expect(getPercentFromPrice('', '100')).toBe('0.00')
    expect(getPercentFromPrice('110', '')).toBe('0.00')
    expect(getPercentFromPrice('abc', '100')).toBe('0.00')
    expect(getPercentFromPrice('110', '0')).toBe('0.00')
  })
})

describe('getCowRawWeight', () => {
  it('maps supported weight strings to their raw bigint values', () => {
    expect(getCowRawWeight('50')).toBe(COW_AMM_RAW_WEIGHT_50)
    expect(getCowRawWeight('80')).toBe(COW_AMM_RAW_WEIGHT_80)
    expect(getCowRawWeight('20')).toBe(COW_AMM_RAW_WEIGHT_20)
  })

  it('throws for unsupported weights', () => {
    expect(() => getCowRawWeight('30')).toThrow(/Invalid weight for cow amm/)
    expect(() => getCowRawWeight(undefined)).toThrow(/Invalid weight for cow amm/)
  })
})

describe('formatNumber', () => {
  it('formats below 1000 with 6 decimals', () => {
    expect(formatNumber('500')).toBe('500.000000')
  })

  it('formats above 1000 with thousands separators and 2 decimals', () => {
    expect(formatNumber('1000.5')).toBe('1,000.50')
  })

  it('formats above 100000 without decimals', () => {
    expect(formatNumber('200000')).toBe('200,000')
  })
})

describe('pool type predicates', () => {
  it('detects stable pools', () => {
    expect(isStablePool(PoolType.Stable)).toBe(true)
    expect(isStablePool(PoolType.StableSurge)).toBe(true)
    expect(isStablePool(PoolType.Weighted)).toBe(false)
  })

  it('detects stable surge pools', () => {
    expect(isStableSurgePool(PoolType.StableSurge)).toBe(true)
    expect(isStableSurgePool(PoolType.Stable)).toBe(false)
  })

  it('detects weighted pools', () => {
    expect(isWeightedPool(PoolType.Weighted)).toBe(true)
    expect(isWeightedPool(PoolType.Stable)).toBe(false)
  })

  it('detects custom weighted pools', () => {
    expect(isCustomWeightedPool(PoolType.Weighted, WeightedPoolStructure.Custom)).toBe(true)
    expect(isCustomWeightedPool(PoolType.Weighted, WeightedPoolStructure.FiftyFifty)).toBe(false)
    expect(isCustomWeightedPool(PoolType.Stable, WeightedPoolStructure.Custom)).toBe(false)
  })

  it('detects auto range (ReClamm) pools', () => {
    expect(isAutoRangePool(PoolType.ReClamm)).toBe(true)
    expect(isAutoRangePool(PoolType.Weighted)).toBe(false)
  })

  it('detects gyro elliptic pools', () => {
    expect(isGyroEllipticPool(PoolType.GyroE)).toBe(true)
    expect(isGyroEllipticPool(PoolType.Stable)).toBe(false)
  })

  it('detects cow pools', () => {
    expect(isCowPool(PoolType.CowAmm)).toBe(true)
    expect(isCowPool(undefined)).toBe(false)
    expect(isCowPool(PoolType.Weighted)).toBe(false)
  })
})

describe('protocol predicates', () => {
  it('detects CoW protocol case-insensitively', () => {
    expect(isCowProtocol('CoW')).toBe(true)
    expect(isCowProtocol('cow')).toBe(true)
    expect(isCowProtocol('Balancer v3')).toBe(false)
  })

  it('detects Balancer protocol case-insensitively', () => {
    expect(isBalancerProtocol('Balancer v3')).toBe(true)
    expect(isBalancerProtocol('balancer v3')).toBe(true)
    expect(isBalancerProtocol('CoW')).toBe(false)
  })
})

describe('isPoolCreatorEnabled', () => {
  it('is only enabled for stable and weighted pools', () => {
    expect(isPoolCreatorEnabled(PoolType.Stable)).toBe(true)
    expect(isPoolCreatorEnabled(PoolType.Weighted)).toBe(true)
    expect(isPoolCreatorEnabled(PoolType.StableSurge)).toBe(false)
    expect(isPoolCreatorEnabled(PoolType.GyroE)).toBe(false)
    expect(isPoolCreatorEnabled(PoolType.ReClamm)).toBe(false)
    expect(isPoolCreatorEnabled(PoolType.CowAmm)).toBe(false)
  })
})
