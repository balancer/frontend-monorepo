import networkConfig from '@/lib/config/networks/mainnet'
import { wETHAddress } from '@/lib/debug-helpers'
import { emptyAddress } from '@/lib/modules/web3/contracts/wagmi-helpers'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { nestedPoolMock } from '../../../__mocks__/nestedPoolMock'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { NestedProportionalRemoveLiquidityHandler } from './NestedProportionalRemoveLiquidity.handler'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { mainnetTestPublicClient } from '@/test/utils/wagmi/wagmi-test-clients'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'

function selectNestedProportionalHandler(pool: Pool): NestedProportionalRemoveLiquidityHandler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.Proportional
  ) as NestedProportionalRemoveLiquidityHandler
}

const defaultQueryInput: QueryRemoveLiquidityInput = {
  humanBptIn: '1',
  tokenOut: emptyAddress, // We don't use in this scenario it but it is required to simplify TS interfaces
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }
await connectWithDefaultUser()

describe('When proportionally removing liquidity for a nested pool', () => {
  test('returns ZERO price impact', async () => {
    const handler = selectNestedProportionalHandler(nestedPoolMock)

    const priceImpact = await handler.getPriceImpact()

    expect(priceImpact).toBe(0)
  })

  test('queries amounts out', async () => {
    const handler = selectNestedProportionalHandler(nestedPoolMock)

    const result = await handler.simulate(defaultQueryInput)

    expect(result.amountsOut).toHaveLength(4) // Nested pool has 4 tokens

    const wethTokenAmountOut = result.amountsOut[0]
    expect(wethTokenAmountOut.token.address).toBe(wETHAddress)
    expect(wethTokenAmountOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectNestedProportionalHandler(nestedPoolMock)

    const queryOutput = await handler.simulate(defaultQueryInput)

    const result = await handler.buildCallData({
      ...defaultBuildInput,
      queryOutput,
    })

    expect(result.to).toBe(networkConfig.contracts.balancer.relayerV6)
    expect(result.data).toBeDefined()

    const hash = await mainnetTestPublicClient.sendTransaction({
      ...result,
      account: defaultTestUserAccount,
      chain: mainnetTestPublicClient.chain,
    })

    const transactionReceipt = await mainnetTestPublicClient.waitForTransactionReceipt({
      hash,
    })

    expect(transactionReceipt).toBeDefined()
  })
})
