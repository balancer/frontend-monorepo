import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { HumanAmount, TokenAmount } from '@balancer/sdk'
import { toHumanAmount } from '../../LiquidityActionHelpers'
import { selectRemoveLiquidityHandler } from '../handlers/selectRemoveLiquidityHandler'
import { RemoveLiquidityType } from '../remove-liquidity.types'
import { useRemoveLiquiditySimulationQuery } from './useRemoveLiquiditySimulationQuery'
import { Address } from 'viem'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { SONIC_CHAIN_ID, seedSonicTestAccount } from '@repo/lib/test/integration/sonic-fixtures'

async function testQuery(humanBptIn: HumanAmount) {
  const handler = selectRemoveLiquidityHandler(
    getApiPoolMock(usdcFlyStS),
    RemoveLiquidityType.Proportional
  )

  const emptyTokenOut = '' as Address // We don't use it but it is required to simplify TS checks

  const { result } = testHook(
    () =>
      useRemoveLiquiditySimulationQuery({
        chainId: SONIC_CHAIN_ID,
        handler,
        humanBptIn,
        tokenOut: emptyTokenOut,
        tokensOut: [],
        enabled: true,
      }),
    {
      wrapper: DefaultPoolTestProvider,
    }
  )

  return result
}

test('runs preview query for proportional remove liquidity', async () => {
  await connectWithDefaultUser()
  await seedSonicTestAccount()

  const humanBptIn: HumanAmount = '10'

  const result = await testQuery(humanBptIn)

  await waitFor(() => expect(result.current.data?.amountsOut).toBeDefined())

  const amountsOut = result.current.data?.amountsOut as TokenAmount[]

  // One amount out per pool token, all non zero for a proportional removal
  expect(amountsOut).toHaveLength(3)

  amountsOut.forEach(amountOut => {
    expect(Number(toHumanAmount(amountOut))).toBeGreaterThan(0)
  })
})
