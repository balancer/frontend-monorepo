import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApolloClient } from '@apollo/client'
import type { Permit2 } from '@balancer/sdk'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { DefaultSwapHandler } from './DefaultSwap.handler'
import { BaseDefaultSwapHandler } from './BaseDefaultSwap.handler'
import type { SdkSimulateSwapResponse } from '../swap.types'
import {
  TEST_ADDRESSES,
  createMockSdkSimulateSwapResponse,
  createSdkBuildSwapInputs,
} from '@repo/lib/test/utils/swap-test-utils'

vi.mock('@repo/lib/config/app.config', () => {
  const mockNetworkConfig = {
    chainId: 1,
    chain: GqlChainValues.Mainnet,
    tokens: {
      addresses: {
        wNativeAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
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
        vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      },
    },
  }
  return {
    getNetworkConfig: vi.fn(() => mockNetworkConfig),
    getChainId: vi.fn(() => 1),
    getNativeAssetAddress: vi.fn(() => '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
    getWrappedNativeAssetAddress: vi.fn(() => '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  }
})

vi.mock('@repo/lib/modules/tokens/token.helpers', () => ({
  isNativeAsset: vi.fn((token: string) => {
    if (!token) return false
    return token.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  }),
  isWrappedNativeAsset: vi.fn((token: string) => {
    if (!token) return false
    return token.toLowerCase() === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()
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
      to: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    }),
    buildCallWithPermit2: vi.fn().mockReturnValue({
      callData: '0xpermit2_tx_data',
      value: BigInt(0),
      to: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
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
    it('builds a standard v2 swap transaction', () => {
      const inputs = createSdkBuildSwapInputs({
        tokenInAddress: TEST_ADDRESSES.weth,
        tokenOutAddress: TEST_ADDRESSES.dai,
      })
      const tx = handler.build(inputs)

      expect(tx.account).toBe(inputs.account)
      expect(tx.chainId).toBe(1)
      expect(tx.to).toBe(TEST_ADDRESSES.vaultV2)
      expect(tx.data).toBe('0xdefault_tx_data')
    })

    it('builds a v3 swap transaction when protocol version is 3', () => {
      const v3Inputs = createSdkBuildSwapInputs({ protocolVersion: 3 })

      const tx = handler.build(v3Inputs)

      expect(tx.account).toBe(v3Inputs.account)
      expect(tx.chainId).toBe(1)
      expect(tx.to).toBe(TEST_ADDRESSES.vaultV2)
    })

    it('includes sender and recipient for v2 swaps', () => {
      const { mockBuildCall, simulateResponse } = createMockSdkSimulateSwapResponse()
      mockBuildCall.mockReturnValue({
        callData: '0xmock',
        value: BigInt(1e18),
        to: TEST_ADDRESSES.vaultV2,
      })

      const inputs = createSdkBuildSwapInputs({ simulateResponse })
      const tx = handler.build(inputs)

      expect(mockBuildCall).toHaveBeenCalled()
      expect(tx.value).toBe(BigInt(1e18))
    })

    it('calls buildCallWithPermit2 for v3 with permit2', () => {
      const { mockBuildCallWithPermit2, simulateResponse } = createMockSdkSimulateSwapResponse({
        protocolVersion: 3,
      })

      const mockPermit2: Permit2 = {
        batch: {
          details: [
            {
              token: TEST_ADDRESSES.weth,
              amount: BigInt(1e18),
              expiration: Math.floor(Date.now() / 1000) + 3600,
              nonce: 0,
            },
          ],
          spender: TEST_ADDRESSES.vaultV2,
          sigDeadline: BigInt(Number.MAX_SAFE_INTEGER),
        },
        signature: '0x',
      }

      const v3WithPermit2 = createSdkBuildSwapInputs({
        simulateResponse,
        permit2: mockPermit2,
      })

      const tx = handler.build(v3WithPermit2)

      expect(tx.to).toBe(TEST_ADDRESSES.vaultV2)
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
