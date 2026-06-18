import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ApolloClient } from '@apollo/client'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { NativeWrapHandler } from './NativeWrap.handler'
import { AuraBalSwapHandler } from './AuraBalSwap.handler'
import {
  TEST_ADDRESSES,
  createSdkBuildSwapInputs,
  createAuraBalBuildSwapInputs,
} from '@repo/lib/test/utils/swap-test-utils'

vi.mock('@repo/lib/config/app.config', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/config/app.config')>()
  return {
    ...actual,
    getNetworkConfig: vi.fn(() => ({
      chainId: 1,
      chain: GqlChainValues.Mainnet,
      tokens: {
        addresses: {
          wNativeAsset: TEST_ADDRESSES.weth,
          auraBal: TEST_ADDRESSES.auraBal,
          bal: TEST_ADDRESSES.bal,
        },
        nativeAsset: { address: TEST_ADDRESSES.eth },
        supportedWrappers: [],
      },
      contracts: { balancer: { vaultV2: TEST_ADDRESSES.vaultV2 } },
    })),
    getChainId: vi.fn(() => 1),
    getNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.eth),
    getWrappedNativeAssetAddress: vi.fn(() => TEST_ADDRESSES.weth),
  }
})

vi.mock('@repo/lib/shared/utils/addresses', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/shared/utils/addresses')>()
  return {
    ...actual,
    isNativeAsset: vi.fn(
      (_chain: string, token: string) => token.toLowerCase() === TEST_ADDRESSES.eth
    ),
    isSameAddress: vi.fn(
      (a?: string, b?: string) => !!(a && b && a.toLowerCase() === b.toLowerCase())
    ),
  }
})

vi.mock('@repo/lib/modules/web3/transports', async importOriginal => {
  const actual = await importOriginal<typeof import('@repo/lib/modules/web3/transports')>()
  return { ...actual, getRpcUrl: vi.fn(() => 'https://mainnet.infura.io/v3/test') }
})

vi.mock('@balancer/sdk', async importOriginal => {
  const actual = await importOriginal<typeof import('@balancer/sdk')>()
  return {
    ...actual,
    Slippage: { fromPercentage: vi.fn((pct: string) => ({ value: Number(pct) / 100 })) },
    SwapKind: { GivenIn: 'GIVEN_IN', GivenOut: 'GIVEN_OUT' },
    Token: class {
      constructor(
        public chainId: number,
        public address: string,
        public decimals: number
      ) {}
    },
    TokenAmount: {
      fromHumanAmount: vi.fn(() => ({ amount: BigInt(1e18), token: { decimals: 18 } })),
    },
    AuraBalSwap: vi.fn().mockImplementation(() => ({
      isAuraBalSwap: vi.fn(() => true),
      query: vi.fn().mockResolvedValue({
        expectedAmountOut: { amount: BigInt(1e18), token: { decimals: 18 } },
      }),
      buildCall: vi.fn().mockReturnValue({
        callData: '0xmock',
        value: BigInt(0),
        to: '0x' + '5'.repeat(40),
      }),
    })),
  }
})

vi.mock('viem', async importOriginal => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    encodeFunctionData: vi.fn(params => `0xencoded_${params.functionName}` as `0x${string}`),
  }
})

describe('NativeWrapHandler.build', () => {
  let handler: NativeWrapHandler

  beforeEach(() => {
    handler = new NativeWrapHandler({ query: vi.fn() } as unknown as ApolloClient)
  })

  it('builds wrap transaction with correct value', () => {
    const tx = handler.build(
      createSdkBuildSwapInputs({
        tokenInAddress: TEST_ADDRESSES.eth,
        tokenOutAddress: TEST_ADDRESSES.weth,
        wethIsEth: true,
      })
    )

    expect(tx.to).toBe(TEST_ADDRESSES.weth)
    expect(tx.value).toBe(BigInt(1e18))
  })

  it('builds unwrap transaction with zero value', () => {
    const tx = handler.build(
      createSdkBuildSwapInputs({
        tokenInAddress: TEST_ADDRESSES.weth,
        tokenOutAddress: TEST_ADDRESSES.eth,
      })
    )

    expect(tx.to).toBe(TEST_ADDRESSES.weth)
    expect(tx.value).toBe(BigInt(0))
  })

  it('throws for non-valid wrap tokens', () => {
    expect(() =>
      handler.build(
        createSdkBuildSwapInputs({
          tokenInAddress: TEST_ADDRESSES.bal,
          tokenOutAddress: TEST_ADDRESSES.weth,
        })
      )
    ).toThrow('Non valid wrap tokens')
  })
})

describe('AuraBalSwapHandler.build', () => {
  let handler: AuraBalSwapHandler

  beforeEach(() => {
    const mockTokens = [
      {
        address: TEST_ADDRESSES.auraBal,
        chainId: 1,
        decimals: 18,
        name: 'auraBAL',
        symbol: 'auraBAL',
      },
      { address: TEST_ADDRESSES.eth, chainId: 1, decimals: 18, name: 'Ethereum', symbol: 'ETH' },
      { address: TEST_ADDRESSES.weth, chainId: 1, decimals: 18, name: 'WETH', symbol: 'WETH' },
      { address: TEST_ADDRESSES.bal, chainId: 1, decimals: 18, name: 'BAL', symbol: 'BAL' },
    ]
    handler = new AuraBalSwapHandler(mockTokens as any)
  })

  it('builds transaction with correct parameters', () => {
    const input = createAuraBalBuildSwapInputs({ slippagePercent: '1.0', wethIsEth: true })
    const tx = handler.build(input)

    expect(tx.account).toBe(input.account)
    expect(tx.chainId).toBe(1)
    expect(tx.data).toBe('0xmock')
  })
})
