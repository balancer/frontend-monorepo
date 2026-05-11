import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  swapActionPastTense,
  parseSwapError,
  getAuraBalAddress,
  getBalAddress,
  isAuraBalSwap,
  isV3SwapRoute,
  orderRouteVersion,
} from './swap.helpers'
import { OSwapAction, type SwapAction } from './swap.types'
import { GqlChain, GqlSorSwapType } from '../../shared/services/api/generated/graphql'
import { SwapSimulationQueryResult } from './queries/useSimulateSwapQuery'
import { isMainnet } from '../chains/chain.utils'

vi.mock('@repo/lib/config/app.config', () => ({
  getNetworkConfig: vi.fn(() => ({
    tokens: {
      addresses: {
        auraBal: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
        bal: '0xba100000625a3754423978a60c9317c58a424e3d',
        wNativeAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      },
    },
  })),
  getNativeAssetAddress: () => '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  getWrappedNativeAssetAddress: () => '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}))

vi.mock('@repo/lib/modules/chains/chain.utils', () => ({
  isMainnet: vi.fn(() => true),
}))

describe('swap.helpers', () => {
  describe('swapActionPastTense', () => {
    it('returns Wrapped for WRAP action', () => {
      expect(swapActionPastTense(OSwapAction.WRAP)).toBe('Wrapped')
    })

    it('returns Unwrapped for UNWRAP action', () => {
      expect(swapActionPastTense(OSwapAction.UNWRAP)).toBe('Unwrapped')
    })

    it('returns Swapped for SWAP action', () => {
      expect(swapActionPastTense(OSwapAction.SWAP)).toBe('Swapped')
    })

    it('throws for unknown action', () => {
      expect(() => swapActionPastTense('unknown' as SwapAction)).toThrow('Unsupported swap action')
    })
  })

  describe('parseSwapError', () => {
    it('returns Unknown error for undefined message', () => {
      expect(parseSwapError(undefined)).toBe('Unknown error')
    })

    it('returns Unknown error for empty message', () => {
      expect(parseSwapError('')).toBe('Unknown error')
    })

    it('returns user-friendly message for WrapAmountTooSmall', () => {
      expect(parseSwapError('WrapAmountTooSmall')).toBe(
        'Your input is too small, please try a bigger amount.'
      )
    })

    it('returns user-friendly message when WrapAmountTooSmall appears in message', () => {
      expect(parseSwapError('Error: WrapAmountTooSmall')).toBe(
        'Your input is too small, please try a bigger amount.'
      )
    })

    it('returns original message for unknown error', () => {
      expect(parseSwapError('Some unknown error')).toBe('Some unknown error')
    })

    it('returns original message when error contains a different pattern', () => {
      expect(parseSwapError('Revert: Execution reverted')).toBe('Revert: Execution reverted')
    })
  })

  describe('getAuraBalAddress', () => {
    it('returns auraBAL address for mainnet', () => {
      expect(getAuraBalAddress(GqlChain.Mainnet)).toBe('0x616e8bfa43f920657b3497dbf40d6b1a02d4608d')
    })

    it('returns auraBAL address for other chains', () => {
      expect(getAuraBalAddress(GqlChain.Polygon)).toBe('0x616e8bfa43f920657b3497dbf40d6b1a02d4608d')
    })
  })

  describe('getBalAddress', () => {
    it('returns BAL address for mainnet', () => {
      expect(getBalAddress(GqlChain.Mainnet)).toBe('0xba100000625a3754423978a60c9317c58a424e3d')
    })

    it('returns BAL address for other chains', () => {
      expect(getBalAddress(GqlChain.Polygon)).toBe('0xba100000625a3754423978a60c9317c58a424e3d')
    })
  })

  describe('isAuraBalSwap', () => {
    const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
    const auraBalAddress = '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d'

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns true for ETH -> auraBAL exact-in swap on mainnet', () => {
      const result = isAuraBalSwap(
        ethAddress,
        auraBalAddress,
        GqlChain.Mainnet,
        GqlSorSwapType.ExactIn
      )
      expect(result).toBe(true)
    })

    it('returns true for WETH -> auraBAL exact-in swap on mainnet', () => {
      const result = isAuraBalSwap(
        wethAddress,
        auraBalAddress,
        GqlChain.Mainnet,
        GqlSorSwapType.ExactIn
      )
      expect(result).toBe(true)
    })

    it('returns true for auraBAL -> BAL exact-in swap on mainnet', () => {
      const result = isAuraBalSwap(
        auraBalAddress,
        balAddress,
        GqlChain.Mainnet,
        GqlSorSwapType.ExactIn
      )
      expect(result).toBe(true)
    })

    it('returns false for non-exact-in swap type', () => {
      const result = isAuraBalSwap(
        ethAddress,
        auraBalAddress,
        GqlChain.Mainnet,
        GqlSorSwapType.ExactOut
      )
      expect(result).toBe(false)
    })

    it('returns false on non-mainnet chain', () => {
      vi.mocked(isMainnet).mockReturnValue(false)
      const result = isAuraBalSwap(
        ethAddress,
        auraBalAddress,
        GqlChain.Polygon,
        GqlSorSwapType.ExactIn
      )
      expect(result).toBe(false)
    })

    it('returns false when neither input nor output is auraBAL', () => {
      const result = isAuraBalSwap(ethAddress, balAddress, GqlChain.Mainnet, GqlSorSwapType.ExactIn)
      expect(result).toBe(false)
    })

    it('returns false when neither input nor output is a relevant token', () => {
      const randomAddress = '0x1234567890abcdef1234567890abcdef12345678'
      const result = isAuraBalSwap(
        auraBalAddress,
        randomAddress,
        GqlChain.Mainnet,
        GqlSorSwapType.ExactIn
      )
      expect(result).toBe(false)
    })
  })

  describe('orderRouteVersion', () => {
    it('returns protocol version from simulation data', () => {
      const mockData = {
        data: { protocolVersion: 3 },
        loading: false,
        error: null,
      } as unknown as SwapSimulationQueryResult

      expect(orderRouteVersion(mockData)).toBe(3)
    })

    it('returns default version 2 when data is missing', () => {
      const mockData = {
        data: null,
        loading: false,
        error: null,
      } as unknown as SwapSimulationQueryResult

      expect(orderRouteVersion(mockData)).toBe(2)
    })

    it('returns default version 2 when data is undefined', () => {
      const mockData = {} as unknown as SwapSimulationQueryResult

      expect(orderRouteVersion(mockData)).toBe(2)
    })
  })

  describe('isV3SwapRoute', () => {
    it('returns true for v3 route', () => {
      const mockData = {
        data: { protocolVersion: 3 },
        loading: false,
        error: null,
      } as unknown as SwapSimulationQueryResult

      expect(isV3SwapRoute(mockData)).toBe(true)
    })

    it('returns false for v2 route', () => {
      const mockData = {
        data: { protocolVersion: 2 },
        loading: false,
        error: null,
      } as unknown as SwapSimulationQueryResult

      expect(isV3SwapRoute(mockData)).toBe(false)
    })

    it('returns false when protocol version is not specified', () => {
      const mockData = {} as unknown as SwapSimulationQueryResult

      expect(isV3SwapRoute(mockData)).toBe(false)
    })
  })
})
