import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { UnbalancedAddLiquidityViaSwapV3Handler } from './UnbalancedAddLiquidityViaSwapV3.handler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { seedSonicTestAccount, sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

/*
  TODO(beets-integration): re-enable once the unbalanced add via swap router is verified on Sonic.
*/
describe.skip('When adding unbalanced liquidity via swap for a V3 pool', async () => {
  const v3Pool = getApiPoolMock(usdcFlyStS)

  const handler = new UnbalancedAddLiquidityViaSwapV3Handler(v3Pool)

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

    expect(result.to).toBeDefined()
    expect(result.data).toBeDefined()
  })
})
