/* eslint-disable max-len */
import { getNetworkConfig } from '@/lib/config/app.config'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { Pool } from '../../../PoolProvider'
import { UnbalancedAddLiquidityV3Handler } from './UnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'

// TODO: unskip this test when sepolia V3 pools are available in production api
describe.skip('When adding unbalanced liquidity for a V3 pool', async () => {
  // Sepolia
  const balAddress = '0xb19382073c7a0addbb56ac6af1808fa49e377b75'
  // const poolId = '0xec1b5ca86c83c7a85392063399e7d2170d502e00' // Sepolia B-50BAL-50WETH
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as unknown as Pool

  const handler = selectAddLiquidityHandler(v3Pool) as UnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: balAddress },
  ]

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0.002)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(100000000000000n)
  })

  it('builds Tx Config', async () => {
    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    const sepoliaRouter = getNetworkConfig(GqlChain.Sepolia).contracts.balancer.router

    expect(result.to).toBe(sepoliaRouter)
    expect(result.data).toBeDefined()
  })
})
