/* eslint-disable max-len */
import networkConfig from '@/lib/config/networks/mainnet'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { polygonTestPublicClient } from '@/test/utils/wagmi/wagmi-test-clients'
import { gyroPoolMock } from '../../../__mocks__/gyroPoolMock'
import { Pool } from '../../../PoolProvider'
import { ProportionalAddLiquidityHandler } from './ProportionalAddLiquidity.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

function selectProportionalHandler(pool: Pool) {
  return selectAddLiquidityHandler(pool) as ProportionalAddLiquidityHandler
}

// USDC address in polygon
const usdcAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' as const
const daiAddress = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063' as const

describe('When adding proportional liquidity for a gyro pool', () => {
  test('has zero price impact', async () => {
    const handler = selectProportionalHandler(gyroPoolMock)

    const priceImpact = await handler.getPriceImpact()
    expect(priceImpact).toBe(0)
  })

  test('simulates given a single human amount', async () => {
    const handler = selectProportionalHandler(gyroPoolMock)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: usdcAddress },
    ]

    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
    const usdcAmountIn = result.sdkQueryOutput.amountsIn[0]
    const daiAmountIn = result.sdkQueryOutput.amountsIn[1]

    expect(usdcAmountIn.token.address).toBe(usdcAddress)
    expect(usdcAmountIn.amount).toBeGreaterThan(0n)
    expect(daiAmountIn.token.address).toBe(daiAddress)
    expect(daiAmountIn.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: usdcAddress },
    ]

    const handler = selectProportionalHandler(gyroPoolMock)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn)

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

// Un-skip when CoW AMM pools are ready in production API
describe.skip('When adding proportional liquidity for a CoW AMM pool', async () => {
  // addresses in sepolia
  const balAddress = '0xb19382073c7a0addbb56ac6af1808fa49e377b75' as const
  const usdcAddress = '0x80d6d3946ed8a1da4e226aa21ccddc32bd127d1a' as const
  const daiAddress = '0xb77eb1a70a96fdaaeb31db1b42f2b8b5846b2613' as const

  const cowAMMPoolId = '0xd1bdc51decb61ee0c98e47fe17217c58be525180'
  // Un-skip when CoW AMM pools are ready in production API
  // const cowAmmPool = await getPoolMock(cowAMMPoolId, GqlChain.Sepolia)
  const cowAmmPool = gyroPoolMock

  test('has zero price impact', async () => {
    const handler = selectProportionalHandler(cowAmmPool)

    const priceImpact = await handler.getPriceImpact()
    expect(priceImpact).toBe(0)
  })

  test('simulates given a single human amount', async () => {
    const handler = selectProportionalHandler(cowAmmPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: daiAddress },
    ]

    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
    const balAmountIn = result.sdkQueryOutput.amountsIn[0]
    const daiAmountIn = result.sdkQueryOutput.amountsIn[1]
    const usdcAmountIn = result.sdkQueryOutput.amountsIn[2]

    expect(balAmountIn.token.address).toBe(balAddress)
    expect(balAmountIn.amount).toBeGreaterThan(0n)

    expect(daiAmountIn.token.address).toBe(daiAddress)
    expect(daiAmountIn.amount).toBeGreaterThan(0n)

    expect(usdcAmountIn.token.address).toBe(usdcAddress)
    expect(usdcAmountIn.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '0.1', tokenAddress: daiAddress },
    ]

    const handler = selectProportionalHandler(cowAmmPool)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn)

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
