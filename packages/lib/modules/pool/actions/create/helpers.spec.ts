import { describe, expect, it } from 'vitest'
import { PoolType } from '@balancer/sdk'
import {
  getGqlPoolType,
  getSwapFeePercentageOptions,
  getMinSwapFeePercentage,
  getPercentFromPrice,
  getCowRawWeight,
  formatNumber,
  isStablePool,
  isCustomWeightedPool,
  isCowPool,
  isCowProtocol,
  isBalancerProtocol,
  isPoolCreatorEnabled,
} from './helpers'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { WeightedPoolStructure } from './constants'

describe('helpers', () => {
  describe('getGqlPoolType', () => {
    it('maps all SDK pool types to their GQL equivalents', () => {
      expect(getGqlPoolType(PoolType.Weighted)).toBe(GqlPoolType.Weighted)
      expect(getGqlPoolType(PoolType.Stable)).toBe(GqlPoolType.Stable)
      expect(getGqlPoolType(PoolType.StableSurge)).toBe(GqlPoolType.Stable)
      expect(getGqlPoolType(PoolType.GyroE)).toBe(GqlPoolType.Gyroe)
      expect(getGqlPoolType(PoolType.ReClamm)).toBe(GqlPoolType.Reclamm)
      expect(getGqlPoolType(PoolType.CowAmm)).toBe(GqlPoolType.CowAmm)
    })

    it('throws for unmapped pool types like LBP', () => {
      expect(() => getGqlPoolType(PoolType.LiquidityBootstrapping as unknown as PoolType)).toThrow(
        'Invalid pool type:'
      )
    })
  })

  describe('getSwapFeePercentageOptions', () => {
    it('returns lower fee options for stable pools (Stable and StableSurge)', () => {
      const stable = getSwapFeePercentageOptions(PoolType.Stable)
      const stableSurge = getSwapFeePercentageOptions(PoolType.StableSurge)
      expect(stable).toEqual(stableSurge)
      expect(stable).toEqual([
        { value: '0.01', tip: 'Best for super stable pairs' },
        { value: '0.05', tip: 'Best for stable-ish pairs' },
      ])
    })

    it('returns higher fee options for weighted pools', () => {
      expect(getSwapFeePercentageOptions(PoolType.Weighted)).toEqual([
        { value: '0.30', tip: 'Best for most weighted pairs' },
        { value: '1.00', tip: 'Best for exotic pairs' },
      ])
    })

    it('returns GyroE-specific fee options', () => {
      expect(getSwapFeePercentageOptions(PoolType.GyroE)).toEqual([
        { value: '0.30', tip: 'Best for most Gyro E-CLP pairs' },
        { value: '1.00', tip: 'Best for exotic pairs' },
      ])
    })

    it('returns reCLAMM fee options as the default for unrecognized pool types', () => {
      const reClamm = getSwapFeePercentageOptions(PoolType.ReClamm)
      const cowAmm = getSwapFeePercentageOptions(PoolType.CowAmm)
      expect(reClamm).toEqual(cowAmm)
      expect(reClamm).toEqual([
        { value: '0.30', tip: 'Best for most reCLAMM pairs' },
        { value: '1.00', tip: 'Best for exotic pairs' },
      ])
    })
  })

  describe('getMinSwapFeePercentage', () => {
    it('returns 0.0001 for stable pools and 0.001 for all others', () => {
      expect(getMinSwapFeePercentage(PoolType.Stable)).toBe(0.0001)
      expect(getMinSwapFeePercentage(PoolType.StableSurge)).toBe(0.0001)
      expect(getMinSwapFeePercentage(PoolType.Weighted)).toBe(0.001)
    })
  })

  describe('getPercentFromPrice', () => {
    it('returns 0.00 for falsy value', () => {
      expect(getPercentFromPrice('', '100')).toBe('0.00')
    })

    it('calculates percentage difference from price', () => {
      expect(getPercentFromPrice('110', '100')).toBe('10.00')
      expect(getPercentFromPrice('90', '100')).toBe('-10.00')
    })
  })

  describe('getCowRawWeight', () => {
    it('returns bigint weights for valid CowAmm splits', () => {
      expect(getCowRawWeight('50')).toBe(1000000000000000000n)
      expect(getCowRawWeight('80')).toBe(8000000000000000000n)
      expect(getCowRawWeight('20')).toBe(2000000000000000000n)
    })

    it('throws for invalid weight values', () => {
      expect(() => getCowRawWeight('30')).toThrow('Invalid weight for cow amm: 30')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers with appropriate precision based on magnitude', () => {
      expect(formatNumber('123.456')).toBe('123.456000')
      expect(formatNumber('1234.56')).toBe('1,234.56')
      expect(formatNumber('123456')).toBe('123,456')
    })
  })

  describe('pool type checks', () => {
    it('isStablePool identifies Stable and StableSurge as stable', () => {
      expect(isStablePool(PoolType.Stable)).toBe(true)
      expect(isStablePool(PoolType.StableSurge)).toBe(true)
      expect(isStablePool(PoolType.Weighted)).toBe(false)
    })

    it('isCustomWeightedPool requires both Weighted type and Custom structure', () => {
      expect(isCustomWeightedPool(PoolType.Weighted, WeightedPoolStructure.Custom)).toBe(true)
      expect(isCustomWeightedPool(PoolType.Weighted, WeightedPoolStructure.FiftyFifty)).toBe(false)
      expect(isCustomWeightedPool(PoolType.Stable, WeightedPoolStructure.Custom)).toBe(false)
    })

    it('isCowPool identifies only CowAmm and handles undefined', () => {
      expect(isCowPool(PoolType.CowAmm)).toBe(true)
      expect(isCowPool(undefined)).toBe(false)
    })
  })

  describe('protocol checks', () => {
    it('isCowProtocol matches CoW case-insensitively', () => {
      expect(isCowProtocol('CoW')).toBe(true)
      expect(isCowProtocol('cow')).toBe(true)
      expect(isCowProtocol('Balancer')).toBe(false)
    })

    it('isBalancerProtocol matches Balancer v3 case-insensitively', () => {
      expect(isBalancerProtocol('Balancer v3')).toBe(true)
      expect(isBalancerProtocol('balancer v3')).toBe(true)
      expect(isBalancerProtocol('CoW')).toBe(false)
    })
  })

  describe('isPoolCreatorEnabled', () => {
    it('enables pool creator only for Stable and Weighted (others require zero address)', () => {
      expect(isPoolCreatorEnabled(PoolType.Stable)).toBe(true)
      expect(isPoolCreatorEnabled(PoolType.Weighted)).toBe(true)
      expect(isPoolCreatorEnabled(PoolType.GyroE)).toBe(false)
      expect(isPoolCreatorEnabled(PoolType.ReClamm)).toBe(false)
    })
  })
})
