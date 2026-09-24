import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { selectAddLiquidityHandler } from '../handlers/selectAddLiquidityHandler'
import { useAddLiquidityPriceImpactQuery } from './useAddLiquidityPriceImpactQuery'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { seedSonicTestAccount, sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

async function testQuery(humanAmountsIn: HumanTokenAmountWithSymbol[]) {
  const handler = selectAddLiquidityHandler(getApiPoolMock(usdcFlyStS))

  const { result } = testHook(
    () => useAddLiquidityPriceImpactQuery({ handler, humanAmountsIn, enabled: true }),
    {
      wrapper: DefaultPoolTestProvider,
    }
  )

  return result
}

test('queries price impact for add liquidity', async () => {
  await connectWithDefaultUser()
  await seedSonicTestAccount()

  // Unbalanced add: only one of the three pool tokens is provided
  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { tokenAddress: sonicTokens.ws, humanAmount: '1', symbol: 'wS' },
    { tokenAddress: sonicTokens.usdc, humanAmount: '0', symbol: 'USDC' },
  ]

  const result = await testQuery(humanAmountsIn)

  await waitFor(() => expect(result.current.data).not.toBeUndefined())

  expect(result.current.data).toBeGreaterThan(0)
  expect(result.current.isLoading).toBeFalsy()
})
