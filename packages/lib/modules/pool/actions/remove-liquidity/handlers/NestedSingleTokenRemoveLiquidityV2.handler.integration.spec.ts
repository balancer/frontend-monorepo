import networkConfig from '@repo/lib/config/networks/mainnet'
import { daiAddress } from '@repo/lib/debug-helpers'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { Pool } from '../../../PoolProvider'
import { QueryRemoveLiquidityInput, RemoveLiquidityType } from '../remove-liquidity.types'
import { selectRemoveLiquidityHandler } from './selectRemoveLiquidityHandler'
import { mainnetTestPublicClient } from '@repo/lib/test/utils/wagmi/wagmi-test-clients'
import { NestedSingleTokenRemoveLiquidityV2Handler } from './NestedSingleTokenRemoveLiquidityV2.handler'
import { getPoolMock } from '../../../__mocks__/getPoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

function selectNestedSingleTokenHandler(pool: Pool): NestedSingleTokenRemoveLiquidityV2Handler {
  return selectRemoveLiquidityHandler(
    pool,
    RemoveLiquidityType.SingleToken
  ) as NestedSingleTokenRemoveLiquidityV2Handler
}

const defaultQueryInput: QueryRemoveLiquidityInput = {
  humanBptIn: '1',
  tokenOut: daiAddress,
  userAddress: defaultTestUserAccount,
}

const defaultBuildInput = { account: defaultTestUserAccount, slippagePercent: '0.2' }

const nestedPool = await getPoolMock(
  '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0',
  GqlChain.Mainnet
)

describe('When removing liquidity with single token in a nested pool', () => {
  test('returns price impact', async () => {
    const handler = selectNestedSingleTokenHandler(nestedPool)

    const priceImpact = await handler.getPriceImpact(defaultQueryInput)

    expect(priceImpact).toBeGreaterThan(0)
  })

  test('queries amounts out', async () => {
    const handler = selectNestedSingleTokenHandler(nestedPool)

    const result = await handler.simulate(defaultQueryInput)

    expect(result.amountsOut).toHaveLength(1) // amountsOut only contains single token (DAI)

    const daiTokenAmountOut = result.amountsOut[0]
    expect(daiTokenAmountOut.token.address).toBe(daiAddress)
    expect(daiTokenAmountOut.amount).toBeGreaterThan(0n)
  })

  test('builds Tx Config', async () => {
    const handler = selectNestedSingleTokenHandler(nestedPool)

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
