/* eslint-disable max-len */
import networkConfig from '@repo/lib/config/networks/mainnet'
import { daiAddress, usdcAddress, usdtAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { mainnetTestPublicClient } from '@repo/test/utils/wagmi/wagmi-test-clients'
import { Pool } from '../../../pool.types'
import { NestedAddLiquidityV2Handler } from './NestedAddLiquidityV2.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { fetchPoolMock } from '../../../__mocks__/fetchPoolMock'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

function selectNestedHandler(pool: Pool) {
  return selectAddLiquidityHandler(pool) as NestedAddLiquidityV2Handler
}

// Balancer 50WETH-50-3pool
const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
const nestedPool = await fetchPoolMock({ poolId, chain: GqlChain.Mainnet })

describe('When adding nested liquidity for a weighted pool', () => {
  test('has zero price impact', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress, symbol: 'DAI' },
    ]
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  test('with single token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: daiAddress, symbol: 'DAI' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(15000000000000000n)
  })

  test('with multiple token input', async () => {
    const handler = selectNestedHandler(nestedPool)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress, symbol: 'WETH' },
      { humanAmount: '1', tokenAddress: daiAddress, symbol: 'DAI' },
      { humanAmount: '1', tokenAddress: usdcAddress, symbol: 'USDC' },
      { humanAmount: '1', tokenAddress: usdtAddress, symbol: 'USDT' },
    ]

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(40000000000000000n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: daiAddress, symbol: 'DAI' },
    ]

    const handler = selectNestedHandler(nestedPool)

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

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
