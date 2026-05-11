import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApolloClient } from '@apollo/client'
import { GqlChain, GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import { DefaultSwapHandler } from './DefaultSwap.handler'
import { BaseDefaultSwapHandler } from './BaseDefaultSwap.handler'
import type { BuildSwapInputs, SdkSimulateSwapResponse, SdkBuildSwapInputs } from '../swap.types'

const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'
const vaultV2Address = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const mockNetworkConfig = {
  chainId: 1,
  chain: GqlChain.Mainnet,
  tokens: {
    addresses: {
      wNativeAsset: wethAddress,
      auraBal: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
      bal: '0xba100000625a3754423978a60c9317c58a424e3d',
    },
    nativeAsset: {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportedWrappers: [],
  },
  contracts: {
    balancer: {
      vaultV2: vaultV2Address,
    },
  },
}

vi.mock('@repo/lib/config/app.config', () => {
  return {
    getNetworkConfig: vi.fn(() => mockNetworkConfig),
    getChainId: vi.fn(() => 1),
    getNativeAssetAddress: vi.fn(() => '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
    getWrappedNativeAssetAddress: vi.fn(() => wethAddress),
  }
})

vi.mock('@repo/lib/modules/tokens/token.helpers', () => ({
  isNativeAsset: vi.fn((token: string) => {
    if (!token) return false
    return token.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  }),
  isWrappedNativeAsset: vi.fn((token: string) => {
    if (!token) return false
    return token.toLowerCase() === wethAddress.toLowerCase()
  }),
  isSameAddress: vi.fn((a?: string, b?: string) => {
    if (!a || !b) return false
    return a.toLowerCase() === b.toLowerCase()
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

vi.mock('@repo/lib/shared/utils/numbers', () => ({
  bn: vi.fn((val: string | number) => ({
    toString: () => String(val),
    times: (n: number) => ({
      toString: () => String(Number(val) * n),
      div: (n: number | string) => ({
        toString: () => String((Number(val) / (typeof n === 'string' ? Number(n) : n)).toFixed(18)),
      }),
    }),
    div: (n: number | string) => ({
      toString: () => String(Number(val) / (typeof n === 'string' ? Number(n) : n)),
    }),
  })),
}))

vi.mock('@balancer/sdk', () => ({
  Slippage: {
    fromPercentage: vi.fn((pct: string) => ({ value: Number(pct) / 100 })),
  },
  SwapKind: {
    GivenIn: 'GIVEN_IN',
    GivenOut: 'GIVEN_OUT',
  },
  Swap: vi.fn().mockImplementation(() => ({
    buildCall: vi.fn().mockReturnValue({
      callData: '0xdefault_tx_data',
      value: BigInt(0),
      to: vaultV2Address,
    }),
    buildCallWithPermit2: vi.fn().mockReturnValue({
      callData: '0xpermit2_tx_data',
      value: BigInt(0),
      to: vaultV2Address,
    }),
  })),
  Path: vi.fn(),
  TokenAmount: vi.fn(),
}))

vi.mock('@repo/lib/shared/services/viem/viem.client', () => ({
  getViemClient: vi.fn(() => ({
    readContract: vi.fn(),
  })),
}))

vi.mock('@repo/lib/modules/web3/transports', () => ({
  getRpcUrl: vi.fn(() => 'https://mainnet.infura.io/v3/test'),
}))

class TestableBaseDefaultSwapHandler extends BaseDefaultSwapHandler {
  name = 'TestableBaseDefaultSwapHandler'

  async simulate(): Promise<SdkSimulateSwapResponse> {
    throw new Error('Not implemented')
  }
}

describe('BaseDefaultSwapHandler', () => {
  let handler: TestableBaseDefaultSwapHandler

  beforeEach(() => {
    handler = new TestableBaseDefaultSwapHandler()
  })

  describe('name', () => {
    it('sets the handler name', () => {
      expect(handler.name).toBe('TestableBaseDefaultSwapHandler')
    })
  })

  describe('build', () => {
    let mockBuildCall: any
    let mockBuildCallWithPermit2: any
    let mockSwapInstance: any
    let mockSwapResponse: any

    beforeEach(() => {
      mockBuildCall = vi.fn().mockReturnValue({
        callData: '0xdefault_tx_data',
        value: BigInt(0),
        to: vaultV2Address,
      })
      mockBuildCallWithPermit2 = vi.fn().mockReturnValue({
        callData: '0xpermit2_tx_data',
        value: BigInt(0),
        to: vaultV2Address,
      })

      mockSwapInstance = {
        buildCall: mockBuildCall,
        buildCallWithPermit2: mockBuildCallWithPermit2,
      }

      mockSwapResponse = {
        swap: mockSwapInstance,
        queryOutput: {
          to: vaultV2Address,
          swapKind: 'GIVEN_IN',
        } as any,
        protocolVersion: 2,
      } as SdkSimulateSwapResponse
    })

    let mockBuildInputs: BuildSwapInputs

    beforeEach(() => {
      mockBuildInputs = {
        tokenIn: {
          address: wethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: daiAddress,
          amount: '100.0',
          scaledAmount: BigInt(1e20),
        },
        swapType: GqlSorSwapType.ExactIn,
        selectedChain: GqlChain.Mainnet,
        account: ('0x' + '1'.repeat(40)) as any,
        slippagePercent: '0.5',
        simulateResponse: mockSwapResponse,
        wethIsEth: false,
      } as BuildSwapInputs
    })

    it('builds a standard v2 swap transaction', () => {
      const tx = handler.build(mockBuildInputs as unknown as SdkBuildSwapInputs)

      expect(tx.account).toBe(mockBuildInputs.account)
      expect(tx.chainId).toBe(1)
      expect(tx.to).toBe(vaultV2Address)
      expect(tx.data).toBe('0xdefault_tx_data')
    })

    it('builds a v3 swap transaction when protocol version is 3', () => {
      const v3Inputs = {
        ...mockBuildInputs,
        simulateResponse: {
          ...mockSwapResponse,
          protocolVersion: 3,
        } as SdkSimulateSwapResponse,
      } as BuildSwapInputs & { wethIsEth: boolean } & {}

      const tx = handler.build(v3Inputs as unknown as SdkBuildSwapInputs)

      expect(tx.account).toBe(mockBuildInputs.account)
      expect(tx.chainId).toBe(1)
      expect(tx.to).toBe(vaultV2Address)
      expect(mockBuildCall).toHaveBeenCalled()
      expect(mockBuildCallWithPermit2).not.toHaveBeenCalled()
    })

    it('includes sender and recipient for v2 swaps', () => {
      mockBuildCall.mockReturnValue({
        callData: '0xmock',
        value: BigInt(1e18),
        to: vaultV2Address,
      })

      const tx = handler.build(mockBuildInputs as unknown as SdkBuildSwapInputs)

      expect(mockBuildCall).toHaveBeenCalled()
      expect(tx.value).toBe(BigInt(1e18))
    })

    it('calls buildCallWithPermit2 for v3 with permit2', () => {
      const mockPermit2 = {
        spender: vaultV2Address,
        amount: BigInt(1e18),
        expiry: Math.floor(Date.now() / 1000) + 3600,
        nonce: BigInt(0),
        sig: '0x' as any,
      }

      const v3WithPermit2 = {
        ...mockBuildInputs,
        permit2: mockPermit2,
        simulateResponse: {
          ...mockSwapResponse,
          protocolVersion: 3,
        } as SdkSimulateSwapResponse,
      } as unknown as SdkBuildSwapInputs

      const tx = handler.build(v3WithPermit2)

      expect(tx.to).toBe(vaultV2Address)
      expect(tx.data).toBe('0xpermit2_tx_data')
      expect(mockBuildCallWithPermit2).toHaveBeenCalledWith(
        expect.objectContaining({
          slippage: expect.anything(),
          deadline: BigInt(Number.MAX_SAFE_INTEGER),
          wethIsEth: false,
          queryOutput: expect.anything(),
        }),
        mockPermit2
      )
    })
  })
})

describe('DefaultSwapHandler', () => {
  let handler: DefaultSwapHandler

  beforeEach(() => {
    handler = new DefaultSwapHandler({
      query: vi.fn().mockResolvedValue({
        data: {
          swaps: {
            protocolVersion: 2,
            routes: [{ hops: [] }],
            paths: [],
          },
        },
      }),
      clearStore: vi.fn(),
    } as unknown as ApolloClient)
  })

  describe('name', () => {
    it('sets the handler name', () => {
      expect(handler.name).toBe('DefaultSwapHandler')
    })
  })
})
