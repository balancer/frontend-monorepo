import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { selectRemoveLiquidityHandler } from '../handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityType } from '../remove-liquidity.types'
import { useRemoveLiquidityPriceImpactQuery } from './useRemoveLiquidityPriceImpactQuery'
import { HumanAmount } from '@balancer/sdk'
import { Address } from 'viem'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { SONIC_CHAIN_ID } from '@repo/lib/test/integration/sonic-fixtures'

const emptyTokenOut = '' as Address // We don't use it but it is required to simplify TS checks

async function testQuery(humanBptIn: HumanAmount) {
  const handler = selectRemoveLiquidityHandler(
    getApiPoolMock(usdcFlyStS),
    RemoveLiquidityType.Proportional
  )

  const { result } = testHook(
    () =>
      useRemoveLiquidityPriceImpactQuery({
        chainId: SONIC_CHAIN_ID,
        handler,
        humanBptIn,
        tokenOut: emptyTokenOut,
        enabled: true,
      }),
    {
      wrapper: DefaultPoolTestProvider,
    }
  )

  return result
}

test('queries price impact for remove liquidity', async () => {
  await connectWithDefaultUser()
  const humanBptIn: HumanAmount = '1'

  const result = await testQuery(humanBptIn)

  await waitFor(() => expect(result.current.data).toBeDefined())

  // Proportional removal has no price impact
  expect(result.current.data).toBe(0)
  expect(result.current.isLoading).toBeFalsy()
})
