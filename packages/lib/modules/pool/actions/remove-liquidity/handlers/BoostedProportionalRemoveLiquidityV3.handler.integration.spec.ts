import { mainnetCompositeRouterBoosted, usdcAddress, waUsdtAddress } from '@repo/lib/debug-helpers'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { connectWithDefaultUser } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { Pool } from '../../../pool.types'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { BoostedProportionalRemoveLiquidityV3Handler } from './BoostedProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcUsdtAaveBoosted } from '../../../__mocks__/pool-examples/boosted'

function selectProportionalHandler(pool: Pool): BoostedProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as BoostedProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

describe('When proportionally removing liquidity for a BOOSTED v3 pool (with 1 underlying and 1 wrapped)', async () => {
  const v3Pool = getApiPoolMock(usdcUsdtAaveBoosted)

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.1',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    tokensOut: [waUsdtAddress, usdcAddress],
    userAddress: defaultTestUserAccount,
  }

  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    expect(result.sdkQueryOutput.to).toBe(mainnetCompositeRouterBoosted)

    const [waUsdtTokenAmountOut, aUsdcTokenAmountOut] = result.amountsOut.sort()

    expect(waUsdtTokenAmountOut.token.address).toBe(waUsdtAddress)
    expect(waUsdtTokenAmountOut.amount).toBeGreaterThan(0n)

    expect(aUsdcTokenAmountOut.token.address).toBe(usdcAddress)
    expect(aUsdcTokenAmountOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(mainnetCompositeRouterBoosted)
    expect(result.data).toBeDefined()
  })
})
