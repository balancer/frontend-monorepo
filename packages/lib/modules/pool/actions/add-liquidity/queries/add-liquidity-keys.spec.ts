import { gyroPoolMock } from '../../../__mocks__/gyroPoolMock'
import { Pool } from '../../../pool.types'
import { addLiquidityKeys } from './add-liquidity-keys'
import { defaultTestUserAccount } from '@repo/test/anvil/anvil-setup'
import {} from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { UnbalancedAddLiquidityV2Handler } from '../handlers/UnbalancedAddLiquidityV2.handler'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { scUsdStS } from '../../../__mocks__/pool-examples/flat'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

function testGenerateLiquidityKeys(pool: Pool) {
  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    {
      tokenAddress: '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae',
      humanAmount: '0',
      symbol: 'scUSD',
    },
    { tokenAddress: sonicTokens.sts, humanAmount: '0', symbol: 'stS' },
  ]

  return addLiquidityKeys.priceImpact({
    handler: new UnbalancedAddLiquidityV2Handler(getApiPoolMock(scUsdStS)),
    userAddress: defaultTestUserAccount,
    pool,
    slippage: '0.2',
    humanAmountsIn,
  })
}

describe('Generates expected query keys', () => {
  test('For an unbalanced pool', () => {
    const result = testGenerateLiquidityKeys(getApiPoolMock(scUsdStS))

    expect(result).toMatchInlineSnapshot(`
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityV2Handler:0x3B7D260597A3e3f90274563a9e481618C6B951Eb:0x25ca5451cd5a50ab1d324b5e64f32c0799661891000200000000000000000018:0.2:[{"tokenAddress":"0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae","humanAmount":"0","symbol":"scUSD"},{"tokenAddress":"0xe5da20f15420ad15de0fa650600afc998bbe3955","humanAmount":"0","symbol":"stS"}]no-permit2",
      ]
    `)
  })

  // TODO: Add a Beets/Sonic Gyro/ECLP pool fixture for proportional add query keys.
  test.skip('For a gyro pool (with proportional adds)', () => {
    const result = testGenerateLiquidityKeys(gyroPoolMock)

    // Only stringifies the first humanAmount in the humanAmountsIn array
    expect(result).toMatchInlineSnapshot(`
      [
        "add-liquidity",
        "price-impact",
        "UnbalancedAddLiquidityV2Handler:0x3B7D260597A3e3f90274563a9e481618C6B951Eb:0xdac42eeb17758daa38caf9a3540c808247527ae3000200000000000000000a2b:0.2:{"tokenAddress":"0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F","humanAmount":"0","symbol":"wjAura"}no-permit2",
      ]
    `)
  })
})
