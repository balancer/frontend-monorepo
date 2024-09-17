/* eslint-disable max-len */
import { poolId } from '@/lib/debug-helpers'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { removeLiquidityKeys } from './remove-liquidity-keys'
import { ProportionalRemoveLiquidityHandler } from '../handlers/ProportionalRemoveLiquidity.handler'
import { aBalWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'

const handler = new ProportionalRemoveLiquidityHandler(aBalWethPoolElementMock())

test('Generates expected query keys', () => {
  const result = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId,
    slippage: '0.2',
    humanBptIn: '1',
  })
  expect(result).toMatchInlineSnapshot(
    `
    [
      "remove-liquidity",
      "price-impact",
      "ProportionalRemoveLiquidityHandler:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266:0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512:0.2:1:undefined:undefined",
    ]
  `
  )

  const result2 = removeLiquidityKeys.priceImpact({
    handler,
    userAddress: defaultTestUserAccount,
    poolId,
    slippage: '0.3',
    humanBptIn: '1',
  })

  expect(result).not.toEqual(result2)
})
