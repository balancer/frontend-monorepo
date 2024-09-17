/* eslint-disable max-len */
import networkConfig from '@/lib/config/networks/mainnet'
import { balAddress, wETHAddress, wjAuraAddress } from '@/lib/debug-helpers'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { UnbalancedAddLiquidityHandler } from './UnbalancedAddLiquidity.handler'
import { selectAddLiquidityHandler } from './selectAddLiquidityHandler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

function selectUnbalancedHandler() {
  return selectAddLiquidityHandler(aWjAuraWethPoolElementMock()) as UnbalancedAddLiquidityHandler
}

describe('When adding unbalanced liquidity for a weighted  pool', () => {
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

    const result = await handler.simulate(humanAmountsIn)

    expect(result.bptOut.amount).toBeGreaterThan(300000000000000000000n)
  })

  test('builds Tx Config', async () => {
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '1', tokenAddress: wETHAddress },
      { humanAmount: '1', tokenAddress: wjAuraAddress },
    ]

    const handler = selectUnbalancedHandler()

    // Store query response in handler instance
    const queryOutput = await handler.simulate(humanAmountsIn)

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
