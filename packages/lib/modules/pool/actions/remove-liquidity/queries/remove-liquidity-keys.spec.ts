import {} from '@repo/lib/debug-helpers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { removeLiquidityKeys } from './remove-liquidity-keys'
import { ProportionalRemoveLiquidityHandler } from '../handlers/ProportionalRemoveLiquidity.handler'
import {} from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { scUsdStS } from '../../../__mocks__/pool-examples/flat'

const handler = new ProportionalRemoveLiquidityHandler(getApiPoolMock(scUsdStS))

test('Generates expected query keys', () => {
  const result = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId: scUsdStS.poolId,
    slippage: '0.2',
    humanBptIn: '1',
  })

  expect(result).toMatchInlineSnapshot(`
    [
      "remove-liquidity",
      "price-impact",
      "ProportionalRemoveLiquidityHandler:0x3B7D260597A3e3f90274563a9e481618C6B951Eb:0x25ca5451cd5a50ab1d324b5e64f32c0799661891000200000000000000000018:0.2:1:undefined::undefined",
    ]
  `)

  const result2 = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId: scUsdStS.poolId,
    slippage: '0.3',
    humanBptIn: '1',
  })

  expect(result).not.toEqual(result2)
})
