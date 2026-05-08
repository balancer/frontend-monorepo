import { describe, expect, it } from 'vitest'
import { PoolType } from '@balancer/sdk'
import {
  validatePoolTokens,
  validatePoolSettings,
  validatePoolDetails,
} from './validatePoolCreationForm'
import { PoolCreationToken, SupportedPoolTypes } from './types'

const mockToken = (overrides: Partial<PoolCreationToken> = {}): PoolCreationToken => ({
  address: '0x1234567890123456789012345678901234567890',
  rateProvider: '0x0000000000000000000000000000000000000000',
  paysYieldFees: false,
  amount: '100',
  weight: '50',
  data: { decimals: 18 } as any,
  ...overrides,
})

describe('validatePoolCreationForm', () => {
  describe('validatePoolTokens', () => {
    describe('isAtMaxTokens', () => {
      it('checks if token count has reached the pool type limit', () => {
        expect(
          validatePoolTokens.isAtMaxTokens(
            PoolType.Stable as SupportedPoolTypes,
            Array(5).fill(mockToken())
          )
        ).toBe(true)
        expect(
          validatePoolTokens.isAtMaxTokens(PoolType.Stable as SupportedPoolTypes, [mockToken()])
        ).toBe(false)
      })
    })

    describe('isTotalWeightTooLow', () => {
      it('returns false when weights are not all populated', () => {
        expect(
          validatePoolTokens.isTotalWeightTooLow([
            mockToken({ weight: '30' }),
            mockToken({ weight: '' }),
          ])
        ).toBe(false)
      })

      it('returns true only when all weights are populated and total is below 100', () => {
        expect(
          validatePoolTokens.isTotalWeightTooLow([
            mockToken({ weight: '30' }),
            mockToken({ weight: '40' }),
          ])
        ).toBe(true)
        expect(
          validatePoolTokens.isTotalWeightTooLow([
            mockToken({ weight: '50' }),
            mockToken({ weight: '50' }),
          ])
        ).toBe(false)
        expect(
          validatePoolTokens.isTotalWeightTooLow([
            mockToken({ weight: '60' }),
            mockToken({ weight: '50' }),
          ])
        ).toBe(false)
      })
    })

    describe('isTotalWeightTooHigh', () => {
      it('returns true when total weight exceeds 100', () => {
        expect(
          validatePoolTokens.isTotalWeightTooHigh([
            mockToken({ weight: '60' }),
            mockToken({ weight: '50' }),
          ])
        ).toBe(true)
        expect(
          validatePoolTokens.isTotalWeightTooHigh([
            mockToken({ weight: '50' }),
            mockToken({ weight: '50' }),
          ])
        ).toBe(false)
        expect(
          validatePoolTokens.isTotalWeightTooHigh([
            mockToken({ weight: '30' }),
            mockToken({ weight: '40' }),
          ])
        ).toBe(false)
      })
    })

    describe('isValidTokenWeights', () => {
      it('always returns true for non-weighted pools', () => {
        expect(validatePoolTokens.isValidTokenWeights(PoolType.Stable, [mockToken()])).toBe(true)
      })

      it('for weighted pools, validates that total weight equals 100', () => {
        expect(
          validatePoolTokens.isValidTokenWeights(PoolType.Weighted, [
            mockToken({ weight: '50' }),
            mockToken({ weight: '50' }),
          ])
        ).toBe(true)
        expect(
          validatePoolTokens.isValidTokenWeights(PoolType.Weighted, [
            mockToken({ weight: '30' }),
            mockToken({ weight: '40' }),
          ])
        ).toBe(false)
      })
    })

    describe('hasAmountError', () => {
      it('returns no error when token has no address or empty amount', () => {
        expect(
          validatePoolTokens.hasAmountError(mockToken({ address: undefined }), PoolType.Weighted)
            .error
        ).toBeUndefined()
        expect(
          validatePoolTokens.hasAmountError(mockToken({ amount: '' }), PoolType.Weighted).error
        ).toBeUndefined()
      })

      it('returns error for zero amount', () => {
        expect(
          validatePoolTokens.hasAmountError(mockToken({ amount: '0' }), PoolType.Weighted).error
        ).toBe('Amount must be greater than 0')
      })

      it('enforces higher minimum for CowAmm tokens with low decimals', () => {
        const lowDecimalsToken = mockToken({ amount: '0.001', data: { decimals: 6 } as any })
        expect(validatePoolTokens.hasAmountError(lowDecimalsToken, PoolType.CowAmm).error).toBe(
          'Minimum amount is 1'
        )

        const sufficientToken = mockToken({ amount: '100', data: { decimals: 6 } as any })
        expect(
          validatePoolTokens.hasAmountError(sufficientToken, PoolType.CowAmm).error
        ).toBeUndefined()
      })
    })
  })

  describe('validatePoolSettings', () => {
    describe('poolRoleAccount', () => {
      it('validates Ethereum addresses', () => {
        expect(
          validatePoolSettings.poolRoleAccount('0x1234567890123456789012345678901234567890')
        ).toBe(true)
        expect(validatePoolSettings.poolRoleAccount('invalid')).toBe('Invalid address')
        expect(validatePoolSettings.poolRoleAccount('')).toBe('Invalid address')
      })
    })

    describe('swapFeePercentage', () => {
      it('validates fee is within the allowed range for the pool type', () => {
        expect(validatePoolSettings.swapFeePercentage('0.30', PoolType.Weighted)).toBe(true)
        expect(validatePoolSettings.swapFeePercentage('1.0', PoolType.Weighted)).toBe(true)
        expect(validatePoolSettings.swapFeePercentage('0.01', PoolType.Stable)).toBe(true)
      })

      it('rejects fees below the minimum for the pool type', () => {
        expect(validatePoolSettings.swapFeePercentage('0.00001', PoolType.Weighted)).toContain(
          'Value must be between'
        )
        expect(validatePoolSettings.swapFeePercentage('0.00005', PoolType.Stable)).toContain(
          'Value must be between'
        )
      })

      it('rejects fees above the maximum', () => {
        expect(validatePoolSettings.swapFeePercentage('15', PoolType.Weighted)).toContain(
          'Value must be between'
        )
      })

      it('enforces stable pool minimum of 0.0001', () => {
        expect(validatePoolSettings.swapFeePercentage('0.0001', PoolType.Stable)).toBe(true)
      })
    })

    describe('amplificationParameter', () => {
      it('validates amp is within SDK constraints (1 to 50000)', () => {
        expect(validatePoolSettings.amplificationParameter('1')).toBe(true)
        expect(validatePoolSettings.amplificationParameter('100')).toBe(true)
        expect(validatePoolSettings.amplificationParameter('50000')).toBe(true)
        expect(validatePoolSettings.amplificationParameter('0.5')).toContain(
          'Value must be between'
        )
        expect(validatePoolSettings.amplificationParameter('50001')).toContain(
          'Value must be between'
        )
      })
    })
  })

  describe('validatePoolDetails', () => {
    describe('name', () => {
      it('validates pool name length (3-32 chars)', () => {
        expect(validatePoolDetails.name('My Pool')).toBe(true)
        expect(validatePoolDetails.name('ABC')).toBe(true)
        expect(validatePoolDetails.name('AB')).toBe('Pool name must be 3 characters or more')
        expect(validatePoolDetails.name('a'.repeat(33))).toBe(
          'Pool name must be 32 characters or less'
        )
        expect(validatePoolDetails.name('a'.repeat(32))).toBe(true)
      })
    })

    describe('symbol', () => {
      it('validates pool symbol length (3-26 chars)', () => {
        expect(validatePoolDetails.symbol('BAL')).toBe(true)
        expect(validatePoolDetails.symbol('WETH')).toBe(true)
        expect(validatePoolDetails.symbol('AB')).toBe('Pool symbol must be 3 characters or more')
        expect(validatePoolDetails.symbol('A'.repeat(27))).toBe(
          'Pool symbol must be 26 characters or less'
        )
        expect(validatePoolDetails.symbol('A'.repeat(26))).toBe(true)
      })
    })
  })
})
