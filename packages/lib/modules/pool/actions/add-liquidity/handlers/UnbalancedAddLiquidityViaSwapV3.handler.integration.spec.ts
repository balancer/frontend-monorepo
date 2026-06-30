import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { UnbalancedAddLiquidityViaSwapV3Handler } from './UnbalancedAddLiquidityViaSwapV3.handler'
import { fetchPoolMock, trimGetPoolQuery } from '../../../__mocks__/fetchPoolMock'

describe('When adding unbalanced liquidity via swap for a V3 2-token pool', async () => {
  const waEthWETHAddress = '0x0bfc9d54fc184518a81162f8fb99c2eaca081202'
  const poolId = '0x1ea5870f7c037930ce1d5d8d9317c670e89e13e3' // rETH-waEthWETH
  const v3Pool = await fetchPoolMock({
    poolId,
    chain: GqlChainValues.Mainnet,
    query: trimGetPoolQuery(),
  })

  const handler = new UnbalancedAddLiquidityViaSwapV3Handler(v3Pool)

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { humanAmount: '0.1', tokenAddress: waEthWETHAddress, symbol: 'waEthWETH' },
  ]

  it('calculates price impact', async () => {
    const priceImpact = await handler.getPriceImpact(humanAmountsIn)
    expect(priceImpact).toBeGreaterThan(0)
  })

  it('queries bptOut', async () => {
    const result = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    expect(result.bptOut.amount).toBeGreaterThan(100000000000000n)
  })

  it('builds Tx Config', async () => {
    const queryOutput = await handler.simulate(humanAmountsIn, defaultTestUserAccount)

    const result = await handler.buildCallData({
      humanAmountsIn,
      account: defaultTestUserAccount,
      slippagePercent: '0.2',
      queryOutput,
    })

    expect(result.to).toBeDefined()
    expect(result.data).toBeDefined()
  })
})
