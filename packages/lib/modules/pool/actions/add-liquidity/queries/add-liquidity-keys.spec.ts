/* eslint-disable max-len */
import { gyroPoolMock } from '../../../__mocks__/gyroPoolMock'
import { Pool } from '../../../pool.types'
import { addLiquidityKeys } from './add-liquidity-keys'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { UnbalancedAddLiquidityV2Handler } from '../handlers/UnbalancedAddLiquidityV2.handler'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'

function testGenerateLiquidityKeys(pool: Pool) {
  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    {
      tokenAddress: '0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F',
      humanAmount: '0',
      symbol: 'wjAura',
    },
    {
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      humanAmount: '0',
      symbol: 'WETH',
    },
  ]
  return addLiquidityKeys.priceImpact({
    handler: new UnbalancedAddLiquidityV2Handler(aWjAuraWethPoolElementMock()),
    userAddress: defaultTestUserAccount,
    pool,
    slippage: '0.2',
    humanAmountsIn,
  })
}

describe('Generates expected query keys', () => {
  test('For an unbalanced pool', () => {
    const result = testGenerateLiquidityKeys(aWjAuraWethPoolElementMock())

    expect(result).toMatchInlineSnapshot(`
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityV2Handler:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266:0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512:0.2:[{"tokenAddress":"0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F","humanAmount":"0","symbol":"wjAura"},{"tokenAddress":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","humanAmount":"0","symbol":"WETH"}]no-permit2",
      ]
    `)
  })

  test('For a gyro pool (with proportional adds)', () => {
    const result = testGenerateLiquidityKeys(gyroPoolMock)

    // Only stringifies the first humanAmount in the humanAmountsIn array
    expect(result).toMatchInlineSnapshot(`
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityV2Handler:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266:0xdac42eeb17758daa38caf9a3540c808247527ae3000200000000000000000a2b:0.2:{"tokenAddress":"0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F","humanAmount":"0","symbol":"wjAura"}no-permit2",
      ]
    `)
  })
})
