import { mainnetRouter } from '@repo/lib/debug-helpers'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { Pool } from '../../../pool.types'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { ProportionalRemoveLiquidityV3Handler } from './ProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { v3StableNonBoosted } from '../../../__mocks__/pool-examples/flat'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'

function selectProportionalHandler(pool: Pool): ProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as ProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

describe('When proportionally removing liquidity for stable (non boosted) v3 pool', async () => {
  const rstEthAddress = '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7'
  const hgETH = '0xc824a08db624942c5e5f330d56530cd1598859fd'
  const v3Pool = getApiPoolMock(v3StableNonBoosted)

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    userAddress: defaultTestUserAccount,
  }

  test('returns ZERO price impact', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const priceImpact = await handler.getPriceImpact()

    expect(priceImpact).toBe(0)
  })
  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    const [rstEthTokenAmountOut, hgEthTokenAmountOut] = result.amountsOut

    expect(rstEthTokenAmountOut.token.address).toBe(rstEthAddress)
    expect(rstEthTokenAmountOut.amount).toBeGreaterThan(100000000000000n)

    expect(hgEthTokenAmountOut.token.address).toBe(hgETH)
    expect(hgEthTokenAmountOut.amount).toBeGreaterThan(200000000000000n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(mainnetRouter)
    expect(result.data).toBeDefined()
  })
})
