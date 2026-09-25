import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { BoostedUnbalancedAddLiquidityV3Handler } from './BoostedUnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '../../../__mocks__/pool-examples/boosted'
import {
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

/*
  TODO(beets-integration): re-enable once a boosted pool with more liquidity exists on Sonic.

  bpt-anS-SiloWS is a PARTIAL boosted stable with ~6.5k USD of liquidity, so a one sided
  add relies on the Vault Buffer holding enough of the opposite side.
*/
describe.skip('When adding unbalanced liquidity for a V3 BOOSTED pool', async () => {
  const v3Pool = getApiPoolMock(anSSiloWSBoosted)

  const handler = selectAddLiquidityHandler(v3Pool) as BoostedUnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0', tokenAddress: sonicTokens.anS, symbol: 'anS' },
    { humanAmount: '1', tokenAddress: sonicTokens.siloWs, symbol: 'SiloWS' },
  ]

  beforeAll(async () => {
    await seedSonicTestAccount()
  })

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(0n)
    expect(result.bptOut.token.address).toBe(v3Pool.id)
  })

  it('builds Tx Config', async () => {
    const queryOutput = await handler.simulate(humanAmountsIn)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    expect(result.to).toBe(sonicContracts.compositeLiquidityRouterBoosted)
    expect(result.data).toBeDefined()
  })
})
