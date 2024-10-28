/* eslint-disable max-len */
import { daiAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { GqlChain, GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import { fakeTokenByAddress } from '@repo/lib/test/data/all-gql-tokens.fake'
import { Address } from 'viem'
import { getPoolMock } from '../../pool/__mocks__/getPoolMock'
import { getPoolActionableTokens } from '../../pool/pool.helpers'
import { GetTokenFn } from '../../tokens/TokensProvider'
import { PoolSwapHandler } from './PoolSwap.handler'
import { ExactInQueryOutput, ExactOutQueryOutput } from '@balancer/sdk'
import { SwapTokenInput } from '../swap.types'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'

describe('PoolSwap handler with v2 nested pool', async () => {
  const mainnetNestedPoolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' // Balancer 50WETH-50-3pool
  const pool = await getPoolMock(mainnetNestedPoolId, GqlChain.Mainnet)

  const getToken: GetTokenFn = (address: string) => {
    return fakeTokenByAddress(address as Address)
  }
  const poolActionableTokens = getPoolActionableTokens(pool, getToken)

  const handler = new PoolSwapHandler(pool, poolActionableTokens)

  it('simulates exact in swap', async () => {
    const result = await handler.simulate({
      chain: pool.chain,
      swapType: GqlSorSwapType.ExactIn,
      swapAmount: '0.1',
      tokenIn: wETHAddress,
      tokenOut: daiAddress,
    })

    expect(result.hopCount).toBe(2)
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

    expect(result.hopCount).toBe(2)
    expect(result.protocolVersion).toBe(2)

    const queryOutput = result.queryOutput as ExactOutQueryOutput
    expect(queryOutput.amountOut.token.address).toBe(daiAddress)
    expect(queryOutput.amountOut.amount).toBe(100000000000000000n)
    expect(queryOutput.expectedAmountIn.token.address).toBe(wETHAddress)
    expect(queryOutput.expectedAmountIn.amount).toBeGreaterThan(0n)
  })
})
