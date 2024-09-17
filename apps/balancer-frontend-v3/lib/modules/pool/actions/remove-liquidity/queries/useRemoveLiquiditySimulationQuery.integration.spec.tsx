import { poolId } from '@/lib/debug-helpers'
import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { HumanAmount, TokenAmount } from '@balancer/sdk'
import { toHumanAmount } from '../../LiquidityActionHelpers'
import { selectRemoveLiquidityHandler } from '../handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityType } from '../remove-liquidity.types'
import { useRemoveLiquiditySimulationQuery } from './useRemoveLiquiditySimulationQuery'
import { Address } from 'viem'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'

async function testQuery(humanBptIn: HumanAmount) {
  const handler = selectRemoveLiquidityHandler(
    aWjAuraWethPoolElementMock(),
    RemoveLiquidityType.Proportional
  )
  const emptyTokenOut = '' as Address // We don't use it but it is required to simplify TS checks
  const { result } = testHook(() =>
    useRemoveLiquiditySimulationQuery({
      handler,
      poolId,
      humanBptIn,
      tokenOut: emptyTokenOut,
      enabled: true,
    })
  )
  return result
}

test('runs preview query for proportional remove liquidity', async () => {
  await connectWithDefaultUser()

  const humanBptIn: HumanAmount = '642.164532327890776754'

  const result = await testQuery(humanBptIn)

  await waitFor(() => expect(result.current.data?.amountsOut).toBeDefined())

  const wjAmountOut = result.current.data?.amountsOut?.[0] as TokenAmount
  const wjOutUnits = toHumanAmount(wjAmountOut)
  const wethAmountOut = result.current.data?.amountsOut?.[1] as TokenAmount
  const wethOutUnits = toHumanAmount(wethAmountOut)

  expect(Number(wjOutUnits)).toBeGreaterThan(1800)
  expect(Number(wethOutUnits)).toBeGreaterThan(0.14)
})
