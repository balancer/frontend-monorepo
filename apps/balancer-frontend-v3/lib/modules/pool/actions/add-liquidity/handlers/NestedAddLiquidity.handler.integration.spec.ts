/* eslint-disable max-len */
import networkConfig from '@/lib/config/networks/mainnet'
import { daiAddress, usdcAddress, usdtAddress, wETHAddress } from '@/lib/debug-helpers'
import { mainnetTestPublicClient } from '@/test/utils/wagmi/wagmi-test-clients'
import { Pool } from '../../../PoolProvider'
import { NestedAddLiquidityHandler } from './NestedAddLiquidity.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { getPoolMock } from '../../../__mocks__/getPoolMock'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

function selectNestedHandler(pool: Pool) {
  return selectAddLiquidityHandler(pool) as NestedAddLiquidityHandler
}

// Balancer 50WETH-50-3pool
const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
const nestedPool = await getPoolMock(poolId, GqlChain.Mainnet)

describe('When adding nested liquidity for a weighted pool', () => {
  test('has zero price impact', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress },
    ]
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  test('with single token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: daiAddress },
    ]

    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(15000000000000000n)
  })

  test('with multiple token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress },
      { humanAmount: '1', tokenAddress: daiAddress },
      { humanAmount: '1', tokenAddress: usdcAddress },
      { humanAmount: '1', tokenAddress: usdtAddress },
    ]

    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(40000000000000000n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: daiAddress },
    ]

    const handler = selectNestedHandler(nestedPool)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput: queryOutput,
    })

    expect(result.to).toBe(networkConfig.contracts.balancer.relayerV6)
    expect(result.data).toBeDefined()
    expect(result.account).toBe(defaultTestUserAccount)

    const { account, data, to, value } = result

    const hash = await mainnetTestPublicClient.sendTransaction({
      account,
      chain: mainnetTestPublicClient.chain,
      data,
      to,
      value,
    })

    const transactionReceipt = await mainnetTestPublicClient.waitForTransactionReceipt({
      hash,
    })

    expect(transactionReceipt).toBeDefined()
  })
})
