/* eslint-disable max-len */
import { gyroPoolMock } from '../../../__mocks__/gyroPoolMock'
import { Pool } from '../../../PoolProvider'
import { addLiquidityKeys } from './add-liquidity-keys'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { UnbalancedAddLiquidityHandler } from '../handlers/UnbalancedAddLiquidity.handler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

function testGenerateLiquidityKeys(pool: Pool) {
  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { tokenAddress: '0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f', humanAmount: '0' },
    { tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', humanAmount: '0' },
  ]
  return addLiquidityKeys.priceImpact({
    handler: new UnbalancedAddLiquidityHandler(aWjAuraWethPoolElementMock()),
    userAddress: defaultTestUserAccount,
    poolId: pool.id,
    poolType: pool.type,
    slippage: '0.2',
    humanAmountsIn,
  })
}

describe('Generates expected query keys', () => {
  test('For an unbalanced pool', () => {
    const result = testGenerateLiquidityKeys(aWjAuraWethPoolElementMock())

    expect(result).toMatchInlineSnapshot(
      `
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityHandler:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266:0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512:0.2:[{"tokenAddress":"0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f","humanAmount":"0"},{"tokenAddress":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","humanAmount":"0"}]",
      ]
    `
    )
  })

  test('For a gyro pool (with proportional adds)', () => {
    const result = testGenerateLiquidityKeys(gyroPoolMock)

    // Only stringifies the first humanAmount in the humanAmountsIn array
    expect(result).toMatchInlineSnapshot(
      `
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityHandler:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266:0xdac42eeb17758daa38caf9a3540c808247527ae3000200000000000000000a2b:0.2:{"tokenAddress":"0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f","humanAmount":"0"}",
      ]
    `
    )
  })
})
