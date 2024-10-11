import networkConfig from '@/lib/config/networks/mainnet'
import { balAddress, sepoliaRouter, wETHAddress } from '@/lib/debug-helpers'
import {
  aBalWethPoolElementMock,
  aPhantomStablePoolMock,
} from '@/test/msw/builders/gqlPoolElement.builders'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { ProportionalRemoveLiquidityHandler } from './ProportionalRemoveLiquidity.handler'
import { emptyAddress } from '@/lib/modules/web3/contracts/wagmi-helpers'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'
// import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
// import { getPoolMock } from '../../../__mocks__/getPoolMock'

const poolMock = aBalWethPoolElementMock() // 80BAL-20WETH

function selectProportionalHandler(pool: Pool): ProportionalRemoveLiquidityHandler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as ProportionalRemoveLiquidityHandler
}

const defaultQueryInput: QueryRemoveLiquidityInput = {
  humanBptIn: '1',
  tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

await connectWithDefaultUser()

describe('When proportionally removing liquidity for a weighted v2 pool', async () => {
  test('returns ZERO price impact', async () => {
    const handler = selectProportionalHandler(poolMock)

    const priceImpact = await handler.getPriceImpact()

    expect(priceImpact).toBe(0)
  })
  test('queries amounts out', async () => {
    const handler = selectProportionalHandler(poolMock)

    const result = await handler.simulate(defaultQueryInput)

    const [balTokenAmountOut, wEthTokenAmountOut] = result.amountsOut

    expect(balTokenAmountOut.token.address).toBe(balAddress)
    expect(balTokenAmountOut.amount).toBeGreaterThan(2000000000000000000n)

    expect(wEthTokenAmountOut.token.address).toBe(wETHAddress)
    expect(wEthTokenAmountOut.amount).toBeGreaterThan(100000000000000n)
  })

  test('builds Tx Config', async () => {
    const handler = selectProportionalHandler(poolMock)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(networkConfig.contracts.balancer.vaultV2)
    expect(result.data).toBeDefined()
  })
})

describe('When removing liquidity from a V2 stable pool', () => {
  test('queries remove liquidity', async () => {
    const pool = aPhantomStablePoolMock() // wstETH-rETH-sfrxETH

    const handler = selectProportionalHandler(pool)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({ ...defaultBuildInput, queryOutput })
    expect(result.account).toBe(defaultTestUserAccount)
  })
})

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
