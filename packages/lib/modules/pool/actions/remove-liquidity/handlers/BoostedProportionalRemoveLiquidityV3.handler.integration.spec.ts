import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { Pool } from '../../../pool.types'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { BoostedProportionalRemoveLiquidityV3Handler } from './BoostedProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '../../../__mocks__/pool-examples/boosted'
import {
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

function selectProportionalHandler(pool: Pool): BoostedProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as BoostedProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

describe('When proportionally removing liquidity for a BOOSTED v3 pool (with 1 pool token and 1 ERC4626)', async () => {
  const v3Pool = getApiPoolMock(anSSiloWSBoosted)

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    tokensOut: [sonicTokens.siloWs, sonicTokens.anS],
    userAddress: defaultTestUserAccount,
  }

  beforeAll(async () => {
    await seedSonicTestAccount()
  })

  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    expect(result.sdkQueryOutput.to).toBe(sonicContracts.compositeLiquidityRouterBoosted)

    const [siloWsTokenAmountOut, anSTokenAmountOut] = result.amountsOut

    expect(siloWsTokenAmountOut!.token.address).toBe(sonicTokens.siloWs)
    expect(siloWsTokenAmountOut!.amount).toBeGreaterThan(0n)

    expect(anSTokenAmountOut!.token.address).toBe(sonicTokens.anS)
    expect(anSTokenAmountOut!.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(sonicContracts.compositeLiquidityRouterBoosted)
    expect(result.data).toBeDefined()
  })
})
