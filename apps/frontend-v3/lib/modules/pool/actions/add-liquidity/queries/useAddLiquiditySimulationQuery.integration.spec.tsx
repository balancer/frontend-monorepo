import { wETHAddress, wjAuraAddress } from '@/lib/debug-helpers'
import { DefaultPoolTestProvider, testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { aWjAuraWethPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { selectAddLiquidityHandler } from '../handlers/selectAddLiquidityHandler'
import { useAddLiquiditySimulationQuery } from './useAddLiquiditySimulationQuery'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

async function testQuery(humanAmountsIn: HumanTokenAmountWithAddress[]) {
  const handler = selectAddLiquidityHandler(aWjAuraWethPoolElementMock())
  const { result } = testHook(
    () => useAddLiquiditySimulationQuery({ handler, humanAmountsIn, enabled: true }),
    {
      wrapper: DefaultPoolTestProvider,
    }
  )
  return result
}

test('queries btp out for add liquidity', async () => {
  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { tokenAddress: wETHAddress, humanAmount: '100' },
    { tokenAddress: wjAuraAddress, humanAmount: '1' },
  ]

  const result = await testQuery(humanAmountsIn)

  await waitFor(() => expect(result.current.data?.bptOut).toBeDefined())

  expect(result.current.data?.bptOut?.amount).toBeDefined()
  expect(result.current.isLoading).toBeFalsy()
})
