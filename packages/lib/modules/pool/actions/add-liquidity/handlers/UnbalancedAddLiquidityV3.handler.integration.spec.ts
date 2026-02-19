import { getNetworkConfig } from '@repo/lib/config/app.config'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { UnbalancedAddLiquidityV3Handler } from './UnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { fetchPoolMock } from '../../../__mocks__/fetchPoolMock'

describe('When adding unbalanced liquidity for a V3 pool', async () => {
  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  const poolId = '0x1ea5870f7c037930ce1d5d8d9317c670e89e13e3' // rETH-waEthWETH
  const v3Pool = await fetchPoolMock({ poolId, chain: GqlChain.Mainnet })

  const handler = selectAddLiquidityHandler(v3Pool) as UnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: wethAddress, symbol: 'WETH' },
  ]

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0.00002)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(100000000000000n)
  })

  it('builds Tx Config', async () => {
    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    const mainnetRouter = getNetworkConfig(GqlChain.Mainnet).contracts.balancer
      .compositeLiquidityRouterBoosted

    expect(result.to).toBe(mainnetRouter)
    expect(result.data).toBeDefined()
  })
})
