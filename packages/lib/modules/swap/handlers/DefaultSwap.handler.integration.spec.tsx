import { ExactInQueryOutput, ExactOutQueryOutput } from '@balancer/sdk'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { daiAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { GqlChain, GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { apolloTestClient } from '@repo/test/utils/apollo-test-client'
import { fetchPoolMock } from '../../pool/__mocks__/fetchPoolMock'
import { SwapTokenInput } from '../swap.types'
import { DefaultSwapHandler } from './DefaultSwap.handler'

/*
  TODO: Skip until we fix why we randomly have this error:
  https://github.com/balancer/frontend-monorepo/actions/runs/12261623377/job/34209050943?pr=288

  The contract function "querySwap" reverted with the following reason: BAL#500
*/
describe.skip('Pool Swap handler with v2 nested pool', async () => {
  const mainnetNestedPoolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' // Balancer 50WETH-50-3pool
  const pool = await fetchPoolMock({ poolId: mainnetNestedPoolId, chain: GqlChain.Mainnet })

  const handler = new DefaultSwapHandler(apolloTestClient)

  it('simulates exact in swap', async () => {
    const result = await handler.simulate({
      chain: pool.chain,
      swapType: GqlSorSwapType.ExactIn,
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
  })

  it('builds exact in swap', async () => {
    const result = await handler.simulate({
      chain: pool.chain,
      swapType: GqlSorSwapType.ExactIn,
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
      swapType: GqlSorSwapType.ExactIn,
      tokenIn,
      tokenOut,
      account: defaultTestUserAccount,
      selectedChain: GqlChain.Mainnet,
      slippagePercent: '0.2',
      wethIsEth: false,
    })

    expect(txConfig.account).toBe(defaultTestUserAccount)
    expect(txConfig.to).toBe(mainnetNetworkConfig.contracts.balancer.vaultV2)
  })

  it('simulates exact out swap', async () => {
    const result = await handler.simulate({
      chain: pool.chain,
      swapType: GqlSorSwapType.ExactOut,
      swapAmount: '0.1',
      tokenIn: wETHAddress,
      tokenOut: daiAddress,
    })

    expect(result.hopCount).toBe(3)
    expect(result.protocolVersion).toBe(2)

    const queryOutput = result.queryOutput as ExactOutQueryOutput
    expect(queryOutput.amountOut.token.address).toBe(daiAddress)
    expect(queryOutput.amountOut.amount).toBe(100000000000000000n)
    expect(queryOutput.expectedAmountIn.token.address).toBe(wETHAddress)
    expect(queryOutput.expectedAmountIn.amount).toBeGreaterThan(0n)
  })
})
