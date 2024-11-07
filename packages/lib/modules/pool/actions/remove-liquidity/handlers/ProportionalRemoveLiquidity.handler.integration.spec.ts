import networkConfig from '@repo/lib/config/networks/mainnet'
import { balAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import {
  aBalWethPoolElementMock,
  aPhantomStablePoolMock,
} from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { connectWithDefaultUser } from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { ProportionalRemoveLiquidityHandler } from './ProportionalRemoveLiquidity.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
// import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
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
  userAddress: defaultTestUserAccount,
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
