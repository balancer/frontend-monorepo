import { sepoliaRouter } from '@/lib/debug-helpers'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { SingleTokenRemoveLiquidityV3Handler } from './SingleTokenRemoveLiquidityV3.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
// import { getPoolMock } from '../../../__mocks__/getPoolMock'
// import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

function selectSingleTokenHandler(pool: Pool): SingleTokenRemoveLiquidityV3Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.SingleToken
  ) as SingleTokenRemoveLiquidityV3Handler
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

// TODO: unskip this test when sepolia V3 pools are available in production api
describe.skip('When removing unbalanced liquidity for a weighted V3 pool', async () => {
  // Sepolia
  const balAddress = '0xb19382073c7a0addbb56ac6af1808fa49e377b75'
  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
  // const poolId = '0xec1b5ca86c83c7a85392063399e7d2170d502e00' // Sepolia B-50BAL-50WETH
  // const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)
  const v3Pool = {} as unknown as Pool

  const defaultQueryInput: QueryRemoveLiquidityInput = {
    humanBptIn: '0.001',
    tokenOut: balAddress,
  }

  test('queries amounts out', async () => {
    const handler = selectSingleTokenHandler(v3Pool)

    const result = await handler.simulate(defaultQueryInput)

    const [wEthTokenAmountOut, balTokenAmountOut] = result.amountsOut

    expect(wEthTokenAmountOut.token.address).toBe(wethAddress)
    expect(wEthTokenAmountOut.amount).toBe(0n)

    expect(balTokenAmountOut.token.address).toBe(balAddress)
    expect(balTokenAmountOut.amount).toBeGreaterThan(50000000000000000n)
  })

  test('builds Tx Config', async () => {
    const handler = selectSingleTokenHandler(v3Pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({ ...defaultBuildInput, queryOutput })

    expect(result.to).toBe(sepoliaRouter)
    expect(result.data).toBeDefined()
  })
})
