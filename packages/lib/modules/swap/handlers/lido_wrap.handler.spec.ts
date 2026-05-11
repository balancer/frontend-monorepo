import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GqlChain } from '../../../shared/services/api/generated/graphql'
import { LidoWrapHandler } from './LidoWrap.handler'
import type { BuildSwapInputs, SimulateSwapInputs, SdkBuildSwapInputs } from '../swap.types'

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
        swapHandler: 'LIDO' as const,
      },
    ],
  },
}

vi.mock('../../config/app.config', () => ({
  getNetworkConfig: vi.fn(() => mockNetworkConfig),
  getChainId: vi.fn(() => 1),
  getNativeAssetAddress: vi.fn(() => ethAddress),
  getWrappedNativeAssetAddress: vi.fn(() => wethAddress),
  isProd: false,
  isDev: true,
  isStaging: false,
  isMainnet: () => true,
  shouldUseAnvilFork: false,
}))

vi.mock('../../tokens/token.helpers', () => ({
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

vi.mock('../../shared/utils/addresses', () => ({
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

vi.mock('../../shared/utils/numbers', () => ({
  bn: vi.fn((val: string | number) => {
    const num = Number(val)
    return {
      toString: () => String(num),
      times: (n: number) => ({
        toString: () => String(num * n),
        div: (d: number | string) => ({
          toString: () => String(num / (typeof d === 'string' ? Number(d) : d)),
        }),
      }),
      div: (d: number | string) => ({
        toString: () => String(num / (typeof d === 'string' ? Number(d) : d)),
      }),
    }
  }),
}))

vi.mock('../../../shared/services/viem/viem.client', () => ({
  getViemClient: vi.fn(() => ({
    readContract: vi.fn().mockResolvedValue(BigInt(1e18)),
  })),
}))

vi.mock('../../web3/transports', () => ({
  getRpcUrl: vi.fn(() => 'https://mainnet.infura.io/v3/test'),
}))

vi.mock('viem', () => ({
  encodeFunctionData: vi.fn(params => `0xencoded_${params.functionName}` as any),
  formatUnits: vi.fn((value: bigint) => (Number(value) / 1e18).toString()),
}))

describe('LidoWrapHandler', () => {
  let handler: LidoWrapHandler

  beforeEach(() => {
    handler = new LidoWrapHandler()
  })

  describe('name', () => {
    it('sets the handler name', () => {
      expect(handler.name).toBe('LidoWrapHandler')
    })
  })

  describe('simulate', () => {
    it('returns correct wrap simulation for stETH -> wstETH', async () => {
      const result = await handler.simulate({
        chain: GqlChain.Mainnet,
        swapType: GqlChain.Mainnet as any,
        swapAmount: '1.0',
        tokenIn: stethAddress,
        tokenOut: wstethAddress,
      })

      expect(result.swapType).toBe(GqlChain.Mainnet as any)
      expect(result.effectivePrice).toBe('1')
      expect(result.effectivePriceReversed).toBe('1')
      expect(result.returnAmount).toBeDefined()
    })

    it('throws when swap tokens are not a wrap pair', async () => {
      await expect(
        handler.simulate({
          chain: GqlChain.Mainnet,
          swapType: GqlChain.Mainnet as any,
          swapAmount: '1.0',
          tokenIn: '0xba100000625a3754423978a60c9317c58a424e3d',
          tokenOut: wethAddress,
        } as SimulateSwapInputs)
      ).rejects.toThrow('LidoWrapHandler called with non valid wrap tokens')
    })
  })

  describe('build', () => {
    it('builds wrap tx for stETH -> wstETH', () => {
      const input: BuildSwapInputs = {
        tokenIn: {
          address: stethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: wstethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlChain.Mainnet as any,
        selectedChain: GqlChain.Mainnet,
        account: ('0x' + '1'.repeat(40)) as any,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      }

      const tx = handler.build(input as unknown as SdkBuildSwapInputs)

      expect(tx.to?.toLowerCase()).toBe(wstethAddress.toLowerCase())
      expect(tx.account).toBe(input.account)
      expect(tx.chainId).toBe(1)
      expect(tx.data).toBeDefined()
    })

    it('builds unwrap tx for wstETH -> stETH', () => {
      const input: BuildSwapInputs = {
        tokenIn: {
          address: wstethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: stethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlChain.Mainnet as any,
        selectedChain: GqlChain.Mainnet,
        account: ('0x' + '2'.repeat(40)) as any,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      }

      const tx = handler.build(input as unknown as SdkBuildSwapInputs)

      expect(tx.to?.toLowerCase()).toBe(wstethAddress.toLowerCase())
      expect(tx.account).toBe(input.account)
      expect(tx.data).toBeDefined()
    })

    it('throws for invalid wrap tokens', () => {
      const input: BuildSwapInputs = {
        tokenIn: {
          address: '0xba100000625a3754423978a60c9317c58a424e3d',
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: wethAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlChain.Mainnet as any,
        selectedChain: GqlChain.Mainnet,
        account: ('0x' + '3'.repeat(40)) as any,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      }

      const originalSupportedWrappers = mockNetworkConfig.tokens.supportedWrappers
      mockNetworkConfig.tokens.supportedWrappers = []

      expect(() => handler.build(input as unknown as SdkBuildSwapInputs)).toThrow(
        'Non valid wrap tokens'
      )

      mockNetworkConfig.tokens.supportedWrappers = originalSupportedWrappers
    })
  })
})
