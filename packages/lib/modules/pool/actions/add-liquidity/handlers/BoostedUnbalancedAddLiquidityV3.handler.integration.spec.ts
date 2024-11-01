/* eslint-disable max-len */
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { Pool } from '../../../PoolProvider'
import { BoostedUnbalancedAddLiquidityV3Handler } from './BoostedUnbalancedAddLiquidityV3.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { getPoolMock } from '../../../__mocks__/getPoolMock'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'

// TODO: unskip this test when sepolia V3 pools are available in production api
describe('When adding unbalanced liquidity for a V3 BOOSTED pool', async () => {
  // Sepolia
  const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

  const usdcAaveAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)
  const usdtAaveAddress = '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)
  const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  // const v3Pool = {} as unknown as Pool

  const handler = selectAddLiquidityHandler(v3Pool) as BoostedUnbalancedAddLiquidityV3Handler

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { humanAmount: '0.1', tokenAddress: usdcAaveAddress },
    { humanAmount: '0.1', tokenAddress: usdtAaveAddress },
  ]

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBe(0)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(100000000000000n)
    expect(result.bptOut.token.address).toBe(poolId)
  })

  it('builds Tx Config', async () => {
    const queryOutput = await handler.simulate(humanAmountsIn)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })
    const router = getNetworkConfig(GqlChain.Sepolia).contracts.balancer.compositeLiquidityRouter
    expect(result.to).toBe(router)
    expect(result.data).toBeDefined()
  })
})
