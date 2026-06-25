import { ExactInQueryOutput, ExactOutQueryOutput } from '@balancer/sdk'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { daiAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { GqlChainValues, GqlSorSwapTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { apolloTestClient } from '@repo/test/utils/apollo-test-client'
import { fetchPoolMock } from '../../pool/__mocks__/fetchPoolMock'
import { SwapTokenInput } from '../swap.types'
import { DefaultSwapHandler } from './DefaultSwap.handler'

const SWAP_SIMULATION_TEST_TIMEOUT_MS = 120_000

describe('Pool Swap handler with v2 nested pool', async () => {
  const mainnetNestedPoolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' // Balancer 50WETH-50-3pool
  const pool = await fetchPoolMock({ poolId: mainnetNestedPoolId, chain: GqlChainValues.Mainnet })

  const handler = new DefaultSwapHandler(apolloTestClient)

  it(
    'simulates exact in swap',
    async () => {
      const result = await handler.simulate({
        chain: pool.chain,
        swapType: GqlSorSwapTypeValues.ExactIn,
        swapAmount: '0.1',
        tokenIn: wETHAddress,
        tokenOut: daiAddress,
      })

      expect(result.hopCount).toBeGreaterThan(0)
      expect(result.protocolVersion).toBe(2)

      const queryOutput = result.queryOutput as ExactInQueryOutput
      expect(queryOutput.amountIn.token.address).toBe(wETHAddress)
      expect(queryOutput.amountIn.amount).toBe(100000000000000000n)
      expect(queryOutput.expectedAmountOut.token.address).toBe(daiAddress)
      expect(queryOutput.expectedAmountOut.amount).toBeGreaterThan(200000000000000000n)
    },
    SWAP_SIMULATION_TEST_TIMEOUT_MS
  )

  it(
    'builds exact in swap',
    async () => {
      const result = await handler.simulate({
        chain: pool.chain,
        swapType: GqlSorSwapTypeValues.ExactIn,
        swapAmount: '0.1',
        tokenIn: wETHAddress,
        tokenOut: daiAddress,
      })

      const tokenIn: SwapTokenInput = {
        address: wETHAddress,
        amount: '0.1',
        scaledAmount: 100000000000000000n,
      }

      const tokenOut: SwapTokenInput = {
        address: daiAddress,
        amount: '0.1',
        scaledAmount: 100000000000000000n,
      }

      const txConfig = handler.build({
        simulateResponse: result,
        swapType: GqlSorSwapTypeValues.ExactIn,
        tokenIn,
        tokenOut,
        account: defaultTestUserAccount,
        selectedChain: GqlChainValues.Mainnet,
        slippagePercent: '0.2',
        wethIsEth: false,
      })

      expect(txConfig.account).toBe(defaultTestUserAccount)
      expect(txConfig.to).toBe(mainnetNetworkConfig.contracts.balancer.vaultV2)
    },
    SWAP_SIMULATION_TEST_TIMEOUT_MS
  )

  it('simulates exact out swap', async () => {
    const result = await handler.simulate({
      chain: pool.chain,
      swapType: GqlSorSwapTypeValues.ExactOut,
      swapAmount: '0.1',
      tokenIn: wETHAddress,
      tokenOut: daiAddress,
    })

    expect(result.hopCount).toBeGreaterThan(0)
    expect(result.protocolVersion).toBe(2)

    const queryOutput = result.queryOutput as ExactOutQueryOutput
    expect(queryOutput.amountOut.token.address).toBe(daiAddress)
    expect(queryOutput.amountOut.amount).toBe(100000000000000000n)
    expect(queryOutput.expectedAmountIn.token.address).toBe(wETHAddress)
    expect(queryOutput.expectedAmountIn.amount).toBeGreaterThan(0n)
  })
})
