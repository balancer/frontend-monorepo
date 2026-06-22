import { describe, expect, it, vi, beforeEach } from 'vitest'
import { parseSwapError, isAuraBalSwap } from './swap.helpers'
import { GqlChainValues, GqlSorSwapTypeValues } from '../../shared/services/api/graphql-enums'
import { isMainnet } from '../chains/chain.utils'
import { TEST_ADDRESSES } from '@repo/lib/test/utils/swap-test-utils'

vi.mock('@repo/lib/config/app.config', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/config/app.config')>()
  return {
    ...actual,
    getNetworkConfig: vi.fn(() => ({
      tokens: {
        addresses: {
          auraBal: TEST_ADDRESSES.auraBal,
          bal: TEST_ADDRESSES.bal,
          wNativeAsset: TEST_ADDRESSES.weth,
        },
      },
    })),
    getNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.eth),
    getWrappedNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.weth),
  }
})

vi.mock('@repo/lib/modules/chains/chain.utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/chains/chain.utils')>()
  return { ...actual, isMainnet: vi.fn(() => true) }
})

vi.mock('@repo/lib/shared/utils/addresses', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/shared/utils/addresses')>()
  return {
    ...actual,
    isSameAddress: vi.fn(
      (a?: string, b?: string) => !!(a && b && a.toLowerCase() === b.toLowerCase())
    ),
  }
})

describe('swap.helpers', () => {
  describe('parseSwapError', () => {
    it('returns Unknown error for undefined message', () => {
      expect(parseSwapError(undefined)).toBe('Unknown error')
    })

    it('returns user-friendly message for WrapAmountTooSmall', () => {
      expect(parseSwapError('WrapAmountTooSmall')).toBe(
        'Your input is too small, please try a bigger amount.'
      )
    })

    it('returns user-friendly message when WrapAmountTooSmall appears in longer message', () => {
      expect(parseSwapError('Error: WrapAmountTooSmall')).toBe(
        'Your input is too small, please try a bigger amount.'
      )
    })

    it('returns original message for unknown error', () => {
      expect(parseSwapError('Some unknown error')).toBe('Some unknown error')
    })
  })

  describe('isAuraBalSwap', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns true for ETH -> auraBAL exact-in swap on mainnet', () => {
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.eth,
          TEST_ADDRESSES.auraBal,
          GqlChainValues.Mainnet,
          GqlSorSwapTypeValues.ExactIn
        )
      ).toBe(true)
    })

    it('returns true for WETH -> auraBAL exact-in swap on mainnet', () => {
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.weth,
          TEST_ADDRESSES.auraBal,
          GqlChainValues.Mainnet,
          GqlSorSwapTypeValues.ExactIn
        )
      ).toBe(true)
    })

    it('returns true for auraBAL -> BAL exact-in swap on mainnet', () => {
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.auraBal,
          TEST_ADDRESSES.bal,
          GqlChainValues.Mainnet,
          GqlSorSwapTypeValues.ExactIn
        )
      ).toBe(true)
    })

    it('returns false for non-exact-in swap type', () => {
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.eth,
          TEST_ADDRESSES.auraBal,
          GqlChainValues.Mainnet,
          GqlSorSwapTypeValues.ExactOut
        )
      ).toBe(false)
    })

    it('returns false on non-mainnet chain', () => {
      vi.mocked(isMainnet).mockReturnValue(false)
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.eth,
          TEST_ADDRESSES.auraBal,
          GqlChainValues.Polygon,
          GqlSorSwapTypeValues.ExactIn
        )
      ).toBe(false)
    })

    it('returns false when neither input nor output is auraBAL or relevant token', () => {
      const randomAddress = '0x1234567890abcdef1234567890abcdef12345678'
      expect(
        isAuraBalSwap(
          TEST_ADDRESSES.auraBal,
          randomAddress,
          GqlChainValues.Mainnet,
          GqlSorSwapTypeValues.ExactIn
        )
      ).toBe(false)
    })
  })
})
