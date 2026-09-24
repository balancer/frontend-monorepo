import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { UnbalancedAddLiquidityV3Handler } from './UnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import {
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

/*
  TODO(beets-integration): re-enable with the rest of the unbalanced add specs.

  The Sonic fixtures are low liquidity pools, so the absolute bptOut thresholds the
  mainnet versions of these specs asserted no longer make sense here.
*/
describe.skip('When adding unbalanced liquidity for a V3 pool', async () => {
  const v3Pool = getApiPoolMock(usdcFlyStS)

  const handler = selectAddLiquidityHandler(v3Pool) as UnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: sonicTokens.ws, symbol: 'wS' },
  ]

  beforeAll(async () => {
    await seedSonicTestAccount()
  })

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
  })

  it('builds Tx Config', async () => {
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    expect(result.to).toBe(sonicContracts.router)
    expect(result.data).toBeDefined()
  })
})
