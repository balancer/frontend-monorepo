import { GqlChainValues, GqlSorSwapTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { wstEthAddress } from '@repo/lib/debug-helpers'

const SIMULATION_TIMEOUT_MS = 120_000

describe('LidoWrapHandler', () => {
  describe('simulate', () => {
    it(
      'returns valid rate for stETH -> wstETH wrap',
      async () => {
        const { LidoWrapHandler } = await import('./LidoWrap.handler')
        const handler = new LidoWrapHandler()

        const result = await handler.simulate({
          chain: GqlChainValues.Mainnet,
          swapType: GqlSorSwapTypeValues.ExactIn,
          swapAmount: '1.0',
          tokenIn: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
          tokenOut: wstEthAddress,
        })

        expect(result.swapType).toBe(GqlSorSwapTypeValues.ExactIn)
        expect(result.returnAmount).toBeDefined()
        expect(Number(result.returnAmount)).toBeGreaterThan(0)
        expect(result.effectivePrice).toBeDefined()
      },
      SIMULATION_TIMEOUT_MS
    )

    it(
      'returns valid rate for wstETH -> stETH unwrap',
      async () => {
        const { LidoWrapHandler } = await import('./LidoWrap.handler')
        const handler = new LidoWrapHandler()

        const result = await handler.simulate({
          chain: GqlChainValues.Mainnet,
          swapType: GqlSorSwapTypeValues.ExactIn,
          swapAmount: '1.0',
          tokenIn: wstEthAddress,
          tokenOut: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        })

        expect(result.swapType).toBe(GqlSorSwapTypeValues.ExactIn)
        expect(result.returnAmount).toBeDefined()
        expect(Number(result.returnAmount)).toBeGreaterThan(0)
      },
      SIMULATION_TIMEOUT_MS
    )
  })

  describe('build', () => {
    it('builds wrap transaction data for stETH -> wstETH', async () => {
      const { LidoWrapHandler } = await import('./LidoWrap.handler')
      const handler = new LidoWrapHandler()

      const tx = handler.build({
        tokenIn: {
          address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: wstEthAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlSorSwapTypeValues.ExactIn,
        selectedChain: GqlChainValues.Mainnet,
        account: defaultTestUserAccount,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      })

      expect(tx.to?.toLowerCase()).toBe(wstEthAddress.toLowerCase())
      expect(tx.account).toBe(defaultTestUserAccount)
      expect(tx.chainId).toBe(1)
      expect(tx.data).toBeDefined()
      expect(tx.data?.startsWith('0x')).toBe(true)
    })

    it('builds unwrap transaction data for wstETH -> stETH', async () => {
      const { LidoWrapHandler } = await import('./LidoWrap.handler')
      const handler = new LidoWrapHandler()

      const tx = handler.build({
        tokenIn: {
          address: wstEthAddress,
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        tokenOut: {
          address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
          amount: '1.0',
          scaledAmount: BigInt(1e18),
        },
        swapType: GqlSorSwapTypeValues.ExactIn,
        selectedChain: GqlChainValues.Mainnet,
        account: defaultTestUserAccount,
        slippagePercent: '0.5',
        simulateResponse: {} as any,
        wethIsEth: false,
      })

      expect(tx.to?.toLowerCase()).toBe(wstEthAddress.toLowerCase())
      expect(tx.account).toBe(defaultTestUserAccount)
      expect(tx.data).toBeDefined()
    })
  })
})
