import { sepoliaCompositeRouter } from '@repo/lib/debug-helpers'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { connectWithDefaultUser } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { BoostedProportionalRemoveLiquidityV3Handler } from './BoostedProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'

function selectProportionalHandler(pool: Pool): BoostedProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as BoostedProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

// TODO: unskip this test when sepolia V3 pools are available in production api
describe.skip('When proportionally removing liquidity for a BOOSTED v3 pool', async () => {
  // Sepolia
  // const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

  const usdcAaveAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)
  const usdtAaveAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)

  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as unknown as Pool

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    userAddress: defaultTestUserAccount,
  }

  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    expect(result.sdkQueryOutput.to).toBe(sepoliaCompositeRouter)

    const [aUsdcTokenAmountOut, aUsdtTokenAmountOut] = result.amountsOut.sort()

    expect(aUsdcTokenAmountOut.token.address).toBe(usdcAaveAddress)
    expect(aUsdcTokenAmountOut.amount).toBeGreaterThan(0n)

    expect(aUsdtTokenAmountOut.token.address).toBe(usdtAaveAddress)
    expect(aUsdtTokenAmountOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(sepoliaCompositeRouter)
    expect(result.data).toBeDefined()
  })
})
