import { DefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

import { selectAddLiquidityHandler } from '../handlers/selectAddLiquidityHandler'
import { useAddLiquiditySimulationQuery } from './useAddLiquiditySimulationQuery'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { usdcFlyStS } from '../../../__mocks__/pool-examples/flat'
import { seedSonicTestAccount, sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

const SIMULATION_WAIT_TIMEOUT_MS = 60_000
const SIMULATION_TEST_TIMEOUT_MS = 120_000

async function testQuery(humanAmountsIn: HumanTokenAmountWithSymbol[]) {
  const handler = selectAddLiquidityHandler(getApiPoolMock(usdcFlyStS))

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
    await seedSonicTestAccount()

    const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
      { tokenAddress: sonicTokens.ws, humanAmount: '1', symbol: 'wS' },
      { tokenAddress: sonicTokens.usdc, humanAmount: '1', symbol: 'USDC' },
      { tokenAddress: sonicTokens.sts, humanAmount: '1', symbol: 'stS' },
    ]

    const result = await testQuery(humanAmountsIn)

    await waitFor(() => expect(result.current.data?.bptOut).toBeDefined(), {
      timeout: SIMULATION_WAIT_TIMEOUT_MS,
    })

    expect(result.current.data?.bptOut?.amount).toBeGreaterThan(0n)
    expect(result.current.isLoading).toBeFalsy()
  },
  SIMULATION_TEST_TIMEOUT_MS
)
