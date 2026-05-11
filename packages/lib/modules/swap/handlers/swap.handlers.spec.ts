import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ApolloClient } from '@apollo/client'
import { GqlChain, GqlSorSwapType } from '../../../shared/services/api/generated/graphql'
import { NativeWrapHandler } from './NativeWrap.handler'
import { AuraBalSwapHandler } from './AuraBalSwap.handler'
import type { BuildSwapInputs, SdkBuildSwapInputs, AuraBalBuildSwapInputs } from '../swap.types'

const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
const wstethAddress = '0x7f39c581F595B53c5cb19bD0b3f8dA6c935E2Ca0'
const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d'
const auraBalAddress = '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d'

const mockNetworkConfig = {
  tokens: {
    addresses: {
      wNativeAsset: wethAddress,
      auraBal: auraBalAddress,
      bal: balAddress,
    },
    nativeAsset: {
      address: ethAddress,
    },
    supportedWrappers: [
      {
        baseToken: stethAddress,
        wrappedToken: wstethAddress,
        swapHandler: 'LIDO' as const,
      },
    ],
  },
  contracts: {
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    },
  },
  chainId: 1,
  chain: GqlChain.Mainnet,
}

vi.mock('@repo/lib/config/app.config', () => ({
  getNetworkConfig: vi.fn(() => mockNetworkConfig),
  getChainId: vi.fn(() => 1),
  getNativeAssetAddress: vi.fn(() => ethAddress),
  getWrappedNativeAssetAddress: vi.fn(() => wethAddress),
}))

vi.mock('@repo/lib/modules/tokens/token.helpers', () => ({
  isNativeAsset: vi.fn((token: string) => {
    if (!token || !ethAddress) return false
    return token.toLowerCase() === ethAddress.toLowerCase()
  }),
  isWrappedNativeAsset: vi.fn((token: string) => {
    if (!token || !wethAddress) return false
    return token.toLowerCase() === wethAddress.toLowerCase()
  }),
  isSameAddress: vi.fn((a?: string, b?: string) => {
    if (!a || !b) return false
    return a.toLowerCase() === b.toLowerCase()
  }),
}))

vi.mock('@repo/lib/shared/utils/addresses', () => ({
  isNativeAsset: vi.fn((chain: string, token: string) => {
    if (!token || !ethAddress) return false
    return token.toLowerCase() === ethAddress.toLowerCase()
  }),
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

vi.mock('@repo/lib/shared/services/viem/viem.client', () => ({
  getViemClient: vi.fn(() => ({
    readContract: vi.fn(),
  })),
}))

vi.mock('@repo/lib/modules/web3/transports', () => ({
  getRpcUrl: vi.fn(() => 'https://mainnet.infura.io/v3/test'),
}))

vi.mock('@balancer/sdk', () => ({
  Token: class {
    chainId: number
    address: string
    decimals: number
    constructor(chainId: number, address: string, decimals: number) {
      this.chainId = chainId
      this.address = address
      this.decimals = decimals
    }
  },
  Slippage: {
    fromPercentage: vi.fn((pct: string) => ({ value: Number(pct) / 100 })),
  },
  SwapKind: {
    GivenIn: 'GIVEN_IN',
    GivenOut: 'GIVEN_OUT',
  },
  TokenAmount: {
    fromHumanAmount: vi.fn(() => ({
      amount: BigInt(1e18),
      token: { decimals: 18 },
    })),
  },
  Path: class {},
  Swap: vi.fn().mockImplementation(() => ({
    buildCall: vi.fn().mockReturnValue({
      callData: '0xmock',
      value: BigInt(0),
      to: '0x' + '5'.repeat(40),
    }),
    buildCallWithPermit2: vi.fn().mockReturnValue({
      callData: '0xpermit2',
      value: BigInt(0),
      to: '0x' + '5'.repeat(40),
    }),
  })),
  AuraBalSwap: vi.fn().mockImplementation(() => ({
    isAuraBalSwap: vi.fn(() => true),
    query: vi.fn().mockResolvedValue({
      expectedAmountOut: {
        amount: BigInt(1e18),
        token: {
          decimals: 18,
        },
      },
    }),
    buildCall: vi.fn().mockReturnValue({
      callData: '0xmock',
      value: BigInt(0),
      to: '0x' + '5'.repeat(40),
    }),
  })),
}))

describe('swap handlers', () => {
  describe('NativeWrapHandler', () => {
    let handler: NativeWrapHandler

    beforeEach(() => {
      handler = new NativeWrapHandler({
        query: vi.fn(),
      } as unknown as ApolloClient)
    })

    describe('name', () => {
      it('sets the handler name', () => {
        expect(handler.name).toBe('NativeWrapHandler')
      })
    })

    describe('simulate', () => {
      it('returns 1:1 swap simulation for ETH -> WETH', async () => {
        const result = await handler.simulate({
          chain: GqlChain.Mainnet,
          swapType: GqlSorSwapType.ExactIn,
          swapAmount: '1.0',
          tokenIn: ethAddress,
          tokenOut: wethAddress,
        })

        expect(result.swapType).toBe(GqlSorSwapType.ExactIn)
        expect(result.effectivePrice).toBe('1')
        expect(result.effectivePriceReversed).toBe('1')
        expect(result.returnAmount).toBe('1.0')
      })

      it('returns 1:1 swap simulation for WETH -> ETH', async () => {
        const result = await handler.simulate({
          chain: GqlChain.Mainnet,
          swapType: GqlSorSwapType.ExactOut,
          swapAmount: '0.5',
          tokenIn: wethAddress,
          tokenOut: ethAddress,
        })

        expect(result.swapType).toBe(GqlSorSwapType.ExactOut)
        expect(result.returnAmount).toBe('0.5')
      })
    })

    describe('build', () => {
      it('builds wrap transaction data for ETH -> WETH', () => {
        const input: BuildSwapInputs = {
          tokenIn: {
            address: ethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          tokenOut: {
            address: wethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          swapType: GqlSorSwapType.ExactIn,
          selectedChain: GqlChain.Mainnet,
          account: ('0x' + '1'.repeat(40)) as any,
          slippagePercent: '0.5',
          simulateResponse: {} as any,
          wethIsEth: true,
        }

        const tx = handler.build(input as unknown as SdkBuildSwapInputs)

        expect(tx.to).toBe(wethAddress)
        expect(tx.value).toBe(BigInt(1e18))
        expect(tx.account).toBe(input.account)
        expect(tx.chainId).toBe(1)
        expect(tx.data).toBeDefined()
      })

      it('builds unwrap transaction data for WETH -> ETH', () => {
        const input: BuildSwapInputs = {
          tokenIn: {
            address: wethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          tokenOut: {
            address: ethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          swapType: GqlSorSwapType.ExactOut,
          selectedChain: GqlChain.Mainnet,
          account: ('0x' + '2'.repeat(40)) as any,
          slippagePercent: '0.5',
          simulateResponse: {} as any,
          wethIsEth: false,
        }

        const tx = handler.build(input as unknown as SdkBuildSwapInputs)

        expect(tx.to).toBe(wethAddress)
        expect(tx.value).toBe(BigInt(0))
        expect(tx.data).toBeDefined()
      })

      it('throws for non-valid wrap tokens', () => {
        const input: BuildSwapInputs = {
          tokenIn: {
            address: balAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          tokenOut: {
            address: wethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          swapType: GqlSorSwapType.ExactIn,
          selectedChain: GqlChain.Mainnet,
          account: ('0x' + '3'.repeat(40)) as any,
          slippagePercent: '0.5',
          simulateResponse: {} as any,
          wethIsEth: false,
        }

        expect(() => handler.build(input as unknown as SdkBuildSwapInputs)).toThrow(
          'Non valid wrap tokens'
        )
      })
    })
  })

  describe('AuraBalSwapHandler', () => {
    let handler: AuraBalSwapHandler

    beforeEach(() => {
      const mockTokens = [
        {
          address: auraBalAddress,
          chainId: 1,
          decimals: 18,
          name: 'auraBAL',
          symbol: 'auraBAL',
        },
        {
          address: ethAddress,
          chainId: 1,
          decimals: 18,
          name: 'Ethereum',
          symbol: 'ETH',
        },
        {
          address: wethAddress,
          chainId: 1,
          decimals: 18,
          name: 'Wrapped Ethereum',
          symbol: 'WETH',
        },
        {
          address: balAddress,
          chainId: 1,
          decimals: 18,
          name: 'Balancer',
          symbol: 'BAL',
        },
      ]

      handler = new AuraBalSwapHandler(mockTokens as any)
    })

    describe('name', () => {
      it('sets the handler name', () => {
        expect(handler.name).toBe('AuraBalSwapHandler')
      })
    })

    describe('simulate', () => {
      it('returns simulation with effective price for exact-in swap', async () => {
        const result = await handler.simulate({
          chain: GqlChain.Mainnet,
          swapType: GqlSorSwapType.ExactIn,
          swapAmount: '1.0',
          tokenIn: ethAddress,
          tokenOut: auraBalAddress,
        })

        expect(result.swapType).toBe(GqlSorSwapType.ExactIn)
        expect(result.returnAmount).toBeDefined()
        expect(result.effectivePrice).toBeDefined()
        expect(result.effectivePriceReversed).toBeDefined()
      })

      it('throws when tokens are not found in the tokens list', async () => {
        const handlerWithoutTokens = new AuraBalSwapHandler([])

        await expect(
          handlerWithoutTokens.simulate({
            chain: GqlChain.Mainnet,
            swapType: GqlSorSwapType.ExactIn,
            swapAmount: '1.0',
            tokenIn: ethAddress,
            tokenOut: auraBalAddress,
          })
        ).rejects.toThrow('Token not found')
      })

      it('wraps native asset address when needed', async () => {
        const result = await handler.simulate({
          chain: GqlChain.Mainnet,
          swapType: GqlSorSwapType.ExactIn,
          swapAmount: '0.5',
          tokenIn: ethAddress,
          tokenOut: wethAddress,
        })

        expect(result.swapType).toBe(GqlSorSwapType.ExactIn)
        expect(result.returnAmount).toBeDefined()
      })
    })

    describe('build', () => {
      it('builds transaction config with correct parameters', () => {
        const mockQueryOutput = {
          swapKind: 'GIVEN_IN',
          expectedAmountOut: {
            token: {
              address: wethAddress,
              decimals: 18,
            },
            amount: BigInt(1e18),
          },
          to: ('0x' + '5'.repeat(40)) as any,
        } as any

        const input: BuildSwapInputs = {
          tokenIn: {
            address: ethAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          tokenOut: {
            address: auraBalAddress,
            amount: '1.0',
            scaledAmount: BigInt(1e18),
          },
          swapType: GqlSorSwapType.ExactIn,
          selectedChain: GqlChain.Mainnet,
          account: ('0x' + '4'.repeat(40)) as any,
          slippagePercent: '1.0',
          simulateResponse: {
            queryOutput: mockQueryOutput,
          } as any,
          wethIsEth: true,
        }

        const tx = handler.build(input as unknown as AuraBalBuildSwapInputs)

        expect(tx.to).toBeDefined()
        expect(tx.account).toBe(input.account)
        expect(tx.chainId).toBe(1)
        expect(tx.data).toBeDefined()
      })
    })
  })
})
