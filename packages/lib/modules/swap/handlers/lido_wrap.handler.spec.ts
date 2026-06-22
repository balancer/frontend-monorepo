import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { LidoWrapHandler } from './LidoWrap.handler'
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
    isNativeAsset: vi.fn((token: string) => token.toLowerCase() === TEST_ADDRESSES.eth),
    isWrappedNativeAsset: vi.fn(
      (token: string) => token.toLowerCase() === TEST_ADDRESSES.weth.toLowerCase()
    ),
    isSameAddress: vi.fn(
      (a?: string, b?: string) => !!(a && b && a.toLowerCase() === b.toLowerCase())
    ),
    sameAddresses: vi.fn(
      (a1: string[], a2: string[]) =>
        a1.every(addr1 => a2.some(addr2 => addr1.toLowerCase() === addr2.toLowerCase())) &&
        a2.every(addr2 => a1.some(addr1 => addr1.toLowerCase() === addr2.toLowerCase()))
    ),
  }
})

vi.mock('@repo/lib/shared/utils/addresses', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/shared/utils/addresses')>()
  return {
    ...actual,
    isSameAddress: vi.fn(
      (a?: string, b?: string) => !!(a && b && a.toLowerCase() === b.toLowerCase())
    ),
    sameAddresses: vi.fn(
      (a1: string[], a2: string[]) =>
        a1.every(addr1 => a2.some(addr2 => addr1.toLowerCase() === addr2.toLowerCase())) &&
        a2.every(addr2 => a1.some(addr1 => addr1.toLowerCase() === addr2.toLowerCase()))
    ),
  }
})

vi.mock('viem', async importOriginal => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    encodeFunctionData: vi.fn(params => `0xencoded_${params.functionName}` as `0x${string}`),
  }
})

describe('LidoWrapHandler.build', () => {
  let handler: LidoWrapHandler

  beforeEach(() => {
    mockNetworkConfig = defaultConfig
    handler = new LidoWrapHandler()
  })

  it('throws for invalid wrap tokens', () => {
    mockNetworkConfig = emptyWrappersConfig
    expect(() =>
      handler.build({
        tokenIn: {
          address: TEST_ADDRESSES.bal,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: TEST_ADDRESSES.weth,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlChainValues.Mainnet as any,
        selectedChain: GqlChainValues.Mainnet,
        account: TEST_ADDRESSES.eth,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      })
    ).toThrow('Non valid wrap tokens')
  })
})
