import { sepoliaRouter } from '@repo/lib/debug-helpers'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { connectWithDefaultUser } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { ProportionalRemoveLiquidityV3Handler } from './ProportionalRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'

function selectProportionalHandler(pool: Pool): ProportionalRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as ProportionalRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

// TODO: unskip this test when sepolia V3 pools are available in production api
describe.skip('When proportionally removing liquidity for a weighted v3 pool', async () => {
  // Sepolia
  const balAddress = '0xb19382073c7a0addbb56ac6af1808fa49e377b75'
  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
  // const poolId = '0xec1b5ca86c83c7a85392063399e7d2170d502e00' // Sepolia B-50BAL-50WETH
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)

  const v3Pool = {} as unknown as Pool

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.01',
    tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
    userAddress: defaultTestUserAccount,
  }

  test('returns ZERO price impact', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const priceImpact = await handler.getPriceImpact()

    expect(priceImpact).toBe(0)
  })
  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    const [wEthTokenAmountOut, balTokenAmountOut] = result.amountsOut

    expect(balTokenAmountOut.token.address).toBe(balAddress)
    expect(balTokenAmountOut.amount).toBeGreaterThan(200000000000000n)

    expect(wEthTokenAmountOut.token.address).toBe(wethAddress)
    expect(wEthTokenAmountOut.amount).toBeGreaterThan(100000000000000n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(sepoliaRouter)
    expect(result.data).toBeDefined()
  })
})

// TODO: unskip this test when sepolia V3 pools are available in production api
describe.skip(`When proportionally removing liquidity using NON BOOSTED remove for a BOOSTED v3 pool
          (if the user wants to get wrapping tokens instead of underlying ones)`, async () => {
  // Sepolia
  // const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

  const stataEthUSDC = '0x8a88124522dbbf1e56352ba3de1d9f78c143751e'
  const stataEthUSDT = '0x978206fae13faf5a8d293fb614326b237684b750'
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

    const [aUsdcTokenAmountOut, aUsdtTokenAmountOut] = result.amountsOut

    expect(aUsdtTokenAmountOut.token.address).toBe(stataEthUSDT)
    expect(aUsdtTokenAmountOut.amount).toBeGreaterThan(0n)

    expect(aUsdcTokenAmountOut.token.address).toBe(stataEthUSDC)
    expect(aUsdcTokenAmountOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(sepoliaRouter)
    expect(result.data).toBeDefined()
  })
})
