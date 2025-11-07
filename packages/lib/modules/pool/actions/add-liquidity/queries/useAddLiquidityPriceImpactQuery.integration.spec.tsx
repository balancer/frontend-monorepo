import { aaveEthAddress, wstEthAddress } from '@repo/lib/debug-helpers'
import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { aWeightedV2PoolMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { selectAddLiquidityHandler } from '../handlers/selectAddLiquidityHandler'
import { useAddLiquidityPriceImpactQuery } from './useAddLiquidityPriceImpactQuery'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'

async function testQuery(humanAmountsIn: HumanTokenAmountWithAddress[]) {
  const handler = selectAddLiquidityHandler(aWeightedV2PoolMock())
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
  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { tokenAddress: wstEthAddress, humanAmount: '1', symbol: 'wstETH' },
    { tokenAddress: aaveEthAddress, humanAmount: '1', symbol: 'AAVE' },
  ]

  const result = await testQuery(humanAmountsIn)

  await waitFor(() => expect(result.current.data).not.toBeUndefined())

  expect(result.current.data).toBeGreaterThan(0.001)
  expect(result.current.isLoading).toBeFalsy()
})
