import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  isNativeWrap,
  isSupportedWrap,
  isWrapOrUnwrap,
  getWrapConfig,
  getWrapHandlerClass,
  getWrapType,
  getWrapperForBaseToken,
} from './wrap.helpers'
import { SupportedWrapHandler, OWrapType } from './swap.types'
import { GqlChain } from '../../shared/services/api/generated/graphql'
import { LidoWrapHandler } from './handlers/LidoWrap.handler'

const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
const wstethAddress = '0x7f39c581F595B53c5cb19bD0b3f8dA6c935E2Ca0'

const mockNetworkConfig = {
  tokens: {
    addresses: {
      wNativeAsset: wethAddress,
    },
    nativeAsset: {
      address: ethAddress,
    },
    supportedWrappers: [
      {
        baseToken: stethAddress,
        wrappedToken: wstethAddress,
        swapHandler: SupportedWrapHandler.LIDO,
      },
    ],
  },
}

vi.mock('@repo/lib/config/app.config', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    getNetworkConfig: vi.fn(() => mockNetworkConfig),
    getNativeAssetAddress: vi.fn(() => ethAddress),
    getWrappedNativeAssetAddress: vi.fn(() => wethAddress),
  }
})

vi.mock('@repo/lib/modules/tokens/token.helpers', () => ({
  isNativeAsset: vi.fn((token: string) => {
    if (!token || !ethAddress) return false
    return token.toLowerCase() === ethAddress.toLowerCase()
  }),
  isWrappedNativeAsset: vi.fn((token: string) => {
    if (!token || !wethAddress) return false
    return token.toLowerCase() === wethAddress.toLowerCase()
  }),
  sameAddresses: vi.fn((a1: string[], a2: string[]) => {
    return (
      a1.every((addr1: string) =>
        a2.some((addr2: string) => addr1.toLowerCase() === addr2.toLowerCase())
      ) &&
      a2.every((addr2: string) =>
        a1.some((addr1: string) => addr1.toLowerCase() === addr2.toLowerCase())
      )
    )
  }),
}))

vi.mock('@repo/lib/shared/utils/addresses', () => ({
  isSameAddress: vi.fn((a?: string, b?: string) => {
    if (!a || !b) return false
    return a.toLowerCase() === b.toLowerCase()
  }),
  sameAddresses: vi.fn((a1: string[], a2: string[]) => {
    return (
      a1.every((addr1: string) =>
        a2.some((addr2: string) => addr1.toLowerCase() === addr2.toLowerCase())
      ) &&
      a2.every((addr2: string) =>
        a1.some((addr1: string) => addr1.toLowerCase() === addr2.toLowerCase())
      )
    )
  }),
}))

describe('wrap.helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isNativeWrap', () => {
    it('returns true for ETH -> WETH on mainnet', () => {
      const result = isNativeWrap(ethAddress, wethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns true for WETH -> ETH on mainnet', () => {
      const result = isNativeWrap(wethAddress, ethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns false for non-native tokens', () => {
      const randomAddress = '0x1234567890abcdef1234567890abcdef12345678'
      const result = isNativeWrap(randomAddress, wethAddress, GqlChain.Mainnet)
      expect(result).toBe(false)
    })
  })

  describe('isSupportedWrap', () => {
    it('returns true for stETH -> wstETH on mainnet', () => {
      const result = isSupportedWrap(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns true for wstETH -> stETH on mainnet', () => {
      const result = isSupportedWrap(wstethAddress, stethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns false for unsupported token pair', () => {
      const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
      const result = isSupportedWrap(balAddress, wethAddress, GqlChain.Mainnet)
      expect(result).toBe(false)
    })

    it('returns false when no supported wrappers configured', () => {
      const originalSupportedWrappers = mockNetworkConfig.tokens.supportedWrappers
      mockNetworkConfig.tokens.supportedWrappers = []

      const result = isSupportedWrap(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(result).toBe(false)

      mockNetworkConfig.tokens.supportedWrappers = originalSupportedWrappers
    })
  })

  describe('isWrapOrUnwrap', () => {
    it('returns true for native wrap', () => {
      const result = isWrapOrUnwrap(ethAddress, wethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns true for supported wrap', () => {
      const result = isWrapOrUnwrap(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(result).toBe(true)
    })

    it('returns false for non-wrap pair', () => {
      const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
      const result = isWrapOrUnwrap(ethAddress, balAddress, GqlChain.Mainnet)
      expect(result).toBe(false)
    })
  })

  describe('getWrapConfig', () => {
    it('returns wrapper config for stETH -> wstETH', () => {
      const config = getWrapConfig(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(config.baseToken).toBe(stethAddress)
      expect(config.wrappedToken).toBe(wstethAddress)
      expect(config.swapHandler).toBe(SupportedWrapHandler.LIDO)
    })

    it('throws for unsupported wrap', () => {
      const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
      expect(() => getWrapConfig(balAddress, wethAddress, GqlChain.Mainnet)).toThrow(
        'Unsupported wrap'
      )
    })
  })

  describe('getWrapHandlerClass', () => {
    it('returns LidoWrapHandler for stETH -> wstETH', () => {
      const HandlerClass = getWrapHandlerClass(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(HandlerClass).toBe(LidoWrapHandler)
    })
  })

  describe('getWrapType', () => {
    it('returns WRAP for stETH -> wstETH', () => {
      const result = getWrapType(stethAddress, wstethAddress, GqlChain.Mainnet)
      expect(result).toBe(OWrapType.WRAP)
    })

    it('returns UNWRAP for wstETH -> stETH', () => {
      const result = getWrapType(wstethAddress, stethAddress, GqlChain.Mainnet)
      expect(result).toBe(OWrapType.UNWRAP)
    })

    it('returns null for non-wrap pair', () => {
      const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
      const result = getWrapType(ethAddress, balAddress, GqlChain.Mainnet)
      expect(result).toBeNull()
    })
  })

  describe('getWrapperForBaseToken', () => {
    it('returns wrapper config for stETH base token', () => {
      const wrapper = getWrapperForBaseToken(stethAddress, GqlChain.Mainnet)
      expect(wrapper).toBeDefined()
      if (wrapper) {
        expect(wrapper.baseToken).toBe(stethAddress)
        expect(wrapper.wrappedToken).toBe(wstethAddress)
      }
    })

    it('returns undefined for unknown base token', () => {
      const randomAddress = '0x1234567890abcdef1234567890abcdef12345678'
      const wrapper = getWrapperForBaseToken(randomAddress, GqlChain.Mainnet)
      expect(wrapper).toBeUndefined()
    })

    it('returns undefined when no wrappers configured', () => {
      const originalSupportedWrappers = mockNetworkConfig.tokens.supportedWrappers
      mockNetworkConfig.tokens.supportedWrappers = []

      const wrapper = getWrapperForBaseToken(stethAddress, GqlChain.Mainnet)
      expect(wrapper).toBeUndefined()

      mockNetworkConfig.tokens.supportedWrappers = originalSupportedWrappers
    })
  })
})
