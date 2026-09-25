import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { Pool } from '../../../pool.types'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { ProportionalRemoveLiquidityV3Handler } from './ProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import {
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

function selectProportionalHandler(pool: Pool): ProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as ProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

describe('When proportionally removing liquidity for a weighted (non boosted) v3 pool', async () => {
  const v3Pool = getApiPoolMock(usdcFlyStS)

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    userAddress: defaultTestUserAccount,
  }

  beforeAll(async () => {
    await seedSonicTestAccount()
  })

  test('returns ZERO price impact', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const priceImpact = await handler.getPriceImpact()

    expect(priceImpact).toBe(0)
  })

  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    const [usdcTokenAmountOut, flyTokenAmountOut, stSTokenAmountOut] = result.amountsOut

    expect(usdcTokenAmountOut!.token.address).toBe(sonicTokens.usdc)
    expect(usdcTokenAmountOut!.amount).toBeGreaterThan(0n)

    expect(flyTokenAmountOut!.token.address).toBe(sonicTokens.fly)
    expect(flyTokenAmountOut!.amount).toBeGreaterThan(0n)

    expect(stSTokenAmountOut!.token.address).toBe(sonicTokens.sts)
    expect(stSTokenAmountOut!.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(sonicContracts.router)
    expect(result.data).toBeDefined()
  })
})
