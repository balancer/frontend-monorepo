import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { Pool } from '../../../pool.types'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { SingleTokenRemoveLiquidityV3Handler } from './SingleTokenRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import {
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

function selectSingleTokenHandler(pool: Pool): SingleTokenRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.SingleToken
  ) as SingleTokenRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

describe('When removing unbalanced liquidity for a weighted V3 pool', async () => {
  const v3Pool = getApiPoolMock(usdcFlyStS)

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: sonicTokens.usdc,
    userAddress: defaultTestUserAccount,
  }

  beforeAll(async () => {
    await seedSonicTestAccount()
  })

  test('queries amounts out', async () => {
    const handler = selectSingleTokenHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    const [usdcTokenAmountOut, flyTokenAmountOut, stSTokenAmountOut] = result.amountsOut

    expect(usdcTokenAmountOut!.token.address).toBe(sonicTokens.usdc)
    expect(usdcTokenAmountOut!.amount).toBeGreaterThan(0n)

    expect(flyTokenAmountOut!.token.address).toBe(sonicTokens.fly)
    expect(flyTokenAmountOut!.amount).toBe(0n)

    expect(stSTokenAmountOut!.token.address).toBe(sonicTokens.sts)
    expect(stSTokenAmountOut!.amount).toBe(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectSingleTokenHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({ ...defaultBuildInput, queryOutput })

    expect(result.to).toBe(sonicContracts.router)
    expect(result.data).toBeDefined()
  })
})
