import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { selectRemoveLiquidityHandler } from '../handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityType } from '../remove-liquidity.types'
import { useRemoveLiquidityPriceImpactQuery } from './useRemoveLiquidityPriceImpactQuery'
import { HumanAmount } from '@balancer/sdk'
import { Address } from 'viem'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'

const emptyTokenOut = '' as Address // We don't use it but it is required to simplify TS checks
const poolMock = aWjAuraWethPoolElementMock()

async function testQuery(humanBptIn: HumanAmount) {
  const handler = selectRemoveLiquidityHandler(
    aWjAuraWethPoolElementMock(),
    RemoveLiquidityType.Proportional
  )
  const { result } = testHook(() =>
    useRemoveLiquidityPriceImpactQuery({
      handler,
      poolId: poolMock.id,
      humanBptIn,
      tokenOut: emptyTokenOut,
      enabled: true,
    })
  )
  return result
}

test('queries price impact for add liquidity', async () => {
  await connectWithDefaultUser()
  const humanBptIn: HumanAmount = '1'

  const result = await testQuery(humanBptIn)

  await waitFor(() => expect(result.current.data).toBeDefined())

  expect(result.current.data).toBeCloseTo(0.002368782867485742)
  expect(result.current.isLoading).toBeFalsy()
})
