import { wETHAddress, wjAuraAddress } from '@repo/lib/debug-helpers'
import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { selectAddLiquidityHandler } from '../handlers/selectAddLiquidityHandler'
import { useAddLiquiditySimulationQuery } from './useAddLiquiditySimulationQuery'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'

const SIMULATION_WAIT_TIMEOUT_MS = 60_000
const SIMULATION_TEST_TIMEOUT_MS = 120_000

async function testQuery(humanAmountsIn: HumanTokenAmountWithSymbol[]) {
  const handler = selectAddLiquidityHandler(aWjAuraWethPoolElementMock())
  const { result } = testHook(
    () => useAddLiquiditySimulationQuery({ handler, humanAmountsIn, enabled: true }),
    {
      wrapper: DefaultPoolTestProvider,
    }
  )
  return result
}

test(
  'queries btp out for add liquidity',
  async () => {
    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: wETHAddress, humanAmount: '100', symbol: 'WETH' },
      { tokenAddress: wjAuraAddress, humanAmount: '1', symbol: 'wjAura' },
    ]

    const result = await testQuery(humanAmountsIn)

    await waitFor(() => expect(result.current.data?.bptOut).toBeDefined(), {
      timeout: SIMULATION_WAIT_TIMEOUT_MS,
    })

    expect(result.current.data?.bptOut?.amount).toBeDefined()
    expect(result.current.isLoading).toBeFalsy()
  },
  SIMULATION_TEST_TIMEOUT_MS
)
