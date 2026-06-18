import { describe, expect, it, vi, beforeEach } from 'vitest'
import { isSupportedWrap, getWrapConfig, getWrapType } from './wrap.helpers'
import { SupportedWrapHandler, OWrapType } from './swap.types'
import { GqlChainValues } from '../../shared/services/api/generated/graphql-enums'
import { TEST_ADDRESSES } from '@repo/lib/test/utils/swap-test-utils'

const defaultConfig = {
  chainId: 1,
  chain: GqlChainValues.Mainnet,
  tokens: {
    addresses: {
      wNativeAsset: TEST_ADDRESSES.weth,
      auraBal: TEST_ADDRESSES.auraBal,
      bal: TEST_ADDRESSES.bal,
    },
    nativeAsset: {
      address: TEST_ADDRESSES.eth,
    },
    supportedWrappers: [
      {
        baseToken: TEST_ADDRESSES.steth,
        wrappedToken: TEST_ADDRESSES.wsteth,
        swapHandler: 'LIDO' as const,
      },
    ],
  },
  contracts: {
    balancer: {
      vaultV2: TEST_ADDRESSES.vaultV2,
    },
  },
}

const emptyWrappersConfig = {
  ...defaultConfig,
  tokens: { ...defaultConfig.tokens, supportedWrappers: [] },
}

let mockNetworkConfig = defaultConfig

vi.mock('@repo/lib/config/app.config', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/config/app.config')>()
  return {
    ...actual,
    getNetworkConfig: vi.fn(() => mockNetworkConfig),
    getChainId: vi.fn(() => 1),
    getNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.eth),
    getWrappedNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.weth),
  }
})

vi.mock('@repo/lib/modules/tokens/token.helpers', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/tokens/token.helpers')>()
  return {
    ...actual,
    isNativeAsset: vi.fn((token: string) => {
      if (!token) return false
      return token.toLowerCase() === TEST_ADDRESSES.eth
    }),
    isWrappedNativeAsset: vi.fn((token: string) => {
      if (!token) return false
      return token.toLowerCase() === TEST_ADDRESSES.weth.toLowerCase()
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
  }
})

vi.mock('@repo/lib/shared/utils/addresses', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/shared/utils/addresses')>()
  return {
    ...actual,
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
  }
})

describe('wrap.helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNetworkConfig = defaultConfig
  })

  describe('isSupportedWrap', () => {
    it('returns true for configured wrap pair in either direction', () => {
      expect(isSupportedWrap(TEST_ADDRESSES.steth, TEST_ADDRESSES.wsteth, GqlChainValues.Mainnet)).toBe(
        true
      )
      expect(isSupportedWrap(TEST_ADDRESSES.wsteth, TEST_ADDRESSES.steth, GqlChainValues.Mainnet)).toBe(
        true
      )
    })

    it('returns false when no wrappers configured', () => {
      mockNetworkConfig = emptyWrappersConfig
      expect(isSupportedWrap(TEST_ADDRESSES.steth, TEST_ADDRESSES.wsteth, GqlChainValues.Mainnet)).toBe(
        false
      )
    })
  })

  describe('getWrapConfig', () => {
    it('returns correct wrapper config for valid pair', () => {
      const config = getWrapConfig(TEST_ADDRESSES.steth, TEST_ADDRESSES.wsteth, GqlChainValues.Mainnet)
      expect(config.baseToken).toBe(TEST_ADDRESSES.steth)
      expect(config.wrappedToken).toBe(TEST_ADDRESSES.wsteth)
      expect(config.swapHandler).toBe(SupportedWrapHandler.LIDO)
    })

    it('throws for unsupported pair', () => {
      expect(() =>
        getWrapConfig(TEST_ADDRESSES.bal, TEST_ADDRESSES.weth, GqlChainValues.Mainnet)
      ).toThrow('Unsupported wrap')
    })
  })

  describe('getWrapType', () => {
    it('returns WRAP when base token is input', () => {
      expect(getWrapType(TEST_ADDRESSES.steth, TEST_ADDRESSES.wsteth, GqlChainValues.Mainnet)).toBe(
        OWrapType.WRAP
      )
    })

    it('returns UNWRAP when wrapped token is input', () => {
      expect(getWrapType(TEST_ADDRESSES.wsteth, TEST_ADDRESSES.steth, GqlChainValues.Mainnet)).toBe(
        OWrapType.UNWRAP
      )
    })

    it('returns null for non-wrap pair', () => {
      expect(getWrapType(TEST_ADDRESSES.eth, TEST_ADDRESSES.bal, GqlChainValues.Mainnet)).toBeNull()
    })
  })
})
