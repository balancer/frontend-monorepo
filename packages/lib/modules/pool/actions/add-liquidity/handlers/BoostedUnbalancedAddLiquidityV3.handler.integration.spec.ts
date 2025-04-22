import { getNetworkConfig } from '@repo/lib/config/app.config'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { BoostedUnbalancedAddLiquidityV3Handler } from './BoostedUnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcUsdtAaveBoosted } from '../../../__mocks__/pool-examples/boosted'
import { usdcAddress, usdtAddress } from '@repo/lib/debug-helpers'

describe('When adding unbalanced liquidity for a V3 BOOSTED pool', async () => {
  const v3Pool = getApiPoolMock(usdcUsdtAaveBoosted)

  const handler = selectAddLiquidityHandler(v3Pool) as BoostedUnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '1', tokenAddress: usdcAddress, symbol: 'USDC' },
    { humanAmount: '1', tokenAddress: usdtAddress, symbol: 'USDT' },
  ]

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(100000000000000n)
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
    const router = getNetworkConfig(GqlChain.Mainnet).contracts.balancer
      .compositeLiquidityRouterBoosted
    expect(result.to).toBe(router)
    expect(result.data).toBeDefined()
  })
})
