/* eslint-disable max-len */
import networkConfig from '@repo/lib/config/networks/mainnet'
import { balAddress, wETHAddress, wjAuraAddress } from '@repo/lib/debug-helpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { defaultTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { UnbalancedAddLiquidityV2Handler } from './UnbalancedAddLiquidityV2.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'

function selectUnbalancedHandler() {
  return selectAddLiquidityHandler(aWjAuraWethPoolElementMock()) as UnbalancedAddLiquidityV2Handler
}

describe('When adding unbalanced liquidity for a weighted V2 pool', () => {
  test('calculates price impact', async () => {
    const handler = selectUnbalancedHandler()

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress },
      { humanAmount: '1', tokenAddress: wjAuraAddress },
    ]

    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0.002)
  })

  test('returns zero price impact when amounts in are zero or empty', async () => {
    const handler = selectUnbalancedHandler()

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '0', tokenAddress: wETHAddress },
      { humanAmount: '', tokenAddress: balAddress },
    ]

    const priceImpact = await handler.getPriceImpact(humanAmountsIn)

    expect(priceImpact).toEqual(0)
  })

  test('queries bptOut', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress },
      { humanAmount: '1', tokenAddress: wjAuraAddress },
    ]

    const handler = selectUnbalancedHandler()

    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(300000000000000000000n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress },
      { humanAmount: '1', tokenAddress: wjAuraAddress },
    ]

    const handler = selectUnbalancedHandler()

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    expect(result.to).toBe(networkConfig.contracts.balancer.vaultV2)
    expect(result.data).toBeDefined()
  })
})
