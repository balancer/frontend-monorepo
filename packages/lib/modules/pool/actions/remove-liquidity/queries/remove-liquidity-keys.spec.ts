import { poolId } from '@repo/lib/debug-helpers'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { removeLiquidityKeys } from './remove-liquidity-keys'
import { ProportionalRemoveLiquidityHandler } from '../handlers/ProportionalRemoveLiquidity.handler'
import { aBalWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'

const handler = new ProportionalRemoveLiquidityHandler(aBalWethPoolElementMock())

test('Generates expected query keys', () => {
  const result = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId,
    slippage: '0.2',
    humanBptIn: '1',
  })
  expect(result).toMatchInlineSnapshot(`
    [
      "remove-liquidity",
      "price-impact",
      "ProportionalRemoveLiquidityHandler:0x3B7D260597A3e3f90274563a9e481618C6B951Eb:0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512:0.2:1:undefined::undefined",
    ]
  `)

  const result2 = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId,
    slippage: '0.3',
    humanBptIn: '1',
  })

  expect(result).not.toEqual(result2)
})
