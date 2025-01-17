/* eslint-disable max-len */
import networkConfig from '@repo/lib/config/networks/mainnet'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { polygonTestPublicClient } from '@repo/lib/test/utils/wagmi/wagmi-test-clients'
import { gyroPoolMock } from '../../../__mocks__/gyroPoolMock'
import { Pool } from '../../../PoolProvider'
import { ProportionalAddLiquidityHandler } from './ProportionalAddLiquidity.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { fetchPoolMock } from '../../../__mocks__/fetchPoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { usdcAddress, wETHAddress } from '@repo/lib/debug-helpers'

function selectProportionalHandler(pool: Pool) {
  return selectAddLiquidityHandler(pool) as ProportionalAddLiquidityHandler
}

// Skip until we find the root cause of this issue:
// Error: Unable to get pool state with balances for v2 pool.
describe.skip('When adding proportional liquidity for a CoW AMM pool', async () => {
  const cowAMMPoolId = '0xf08d4dea369c456d26a3168ff0024b904f2d8b91'
  const cowAmmPool = await fetchPoolMock(cowAMMPoolId, GqlChain.Mainnet) // USDC-WETH

  test('has zero price impact', async () => {
    const handler = selectProportionalHandler(cowAmmPool)

    const priceImpact = await handler.getPriceImpact()
    expect(priceImpact).toBe(0)
  })

  test('simulates given a single human amount', async () => {
    const handler = selectProportionalHandler(cowAmmPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress, symbol: 'WETH' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
    const usdcAmountIn = result.sdkQueryOutput.amountsIn[0]
    const wethAmountIn = result.sdkQueryOutput.amountsIn[1]

    expect(usdcAmountIn.token.address).toBe(usdcAddress)
    expect(usdcAmountIn.amount).toBeGreaterThan(0n)

    expect(wethAmountIn.token.address).toBe(wETHAddress)
    expect(wethAmountIn.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '0.1', tokenAddress: wETHAddress, symbol: 'WETH' },
    ]

    const handler = selectProportionalHandler(cowAmmPool)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput: queryOutput,
    })

    expect(result.to).toBe(cowAMMPoolId)
    expect(result.data).toBeDefined()
    expect(result.account).toBe(defaultTestUserAccount)
  })
})

// Skip until we find the root cause of this issue:
// Error: Unable to get pool state with balances for v2 pool.
describe.skip('When adding proportional liquidity for a gyro pool', () => {
  // USDC address in polygon
  const polygonUsdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' as const
  const polygonDaiAddress = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063' as const

  test('has zero price impact', async () => {
    const handler = selectProportionalHandler(gyroPoolMock)

    const priceImpact = await handler.getPriceImpact()
    expect(priceImpact).toBe(0)
  })

  test('simulates given a single human amount', async () => {
    const handler = selectProportionalHandler(gyroPoolMock)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: polygonUsdcAddress, symbol: 'USDC' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
    const usdcAmountIn = result.sdkQueryOutput.amountsIn[0]
    const daiAmountIn = result.sdkQueryOutput.amountsIn[1]

    expect(usdcAmountIn.token.address).toBe(polygonUsdcAddress)
    expect(usdcAmountIn.amount).toBeGreaterThan(0n)
    expect(daiAmountIn.token.address).toBe(polygonDaiAddress)
    expect(daiAmountIn.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: polygonUsdcAddress, symbol: 'USDC' },
    ]

    const handler = selectProportionalHandler(gyroPoolMock)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput: queryOutput,
    })

    expect(result.to).toBe(networkConfig.contracts.balancer.vaultV2)
    expect(result.data).toBeDefined()
    expect(result.account).toBe(defaultTestUserAccount)

    const hash = await polygonTestPublicClient.sendTransaction({
      ...result,
      chain: polygonTestPublicClient.chain,
    })

    const transactionReceipt = await polygonTestPublicClient.waitForTransactionReceipt({
      hash,
    })

    expect(transactionReceipt).toBeDefined()
  })
})
