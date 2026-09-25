import { TransactionLabels } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'
import { act } from 'react'
import { Address, parseUnits } from 'viem'
import { useManagedErc20Transaction } from './useManagedErc20Transaction'
import {
  SONIC_CHAIN_ID,
  seedSonicTestAccount,
  sonicContracts,
  sonicTokens,
} from '@repo/lib/test/integration/sonic-fixtures'

const TRANSACTION_WAIT_TIMEOUT_MS = 60_000
const TRANSACTION_TEST_TIMEOUT_MS = 120_000

await connectWithDefaultUser()

beforeAll(async () => {
  await seedSonicTestAccount()
})

test(
  'token approval transaction (wS)',
  async () => {
    const { result } = testHook(() =>
      useManagedErc20Transaction({
        chainId: SONIC_CHAIN_ID,
        tokenAddress: sonicTokens.ws as Address,
        functionName: 'approve',
        args: [sonicContracts.vaultV2, parseUnits('100', 18)],
        enabled: true,
        simulationMeta: {},
        labels: {} as TransactionLabels,
        onTransactionChange: () => {},
      })
    )

    await waitFor(() => expect(result.current.simulation.isSuccess).toBeTruthy(), {
      timeout: TRANSACTION_WAIT_TIMEOUT_MS,
    })

    await act(() => result.current.executeAsync())

    await waitFor(() => expect(result.current.execution.isSuccess).toBeTruthy(), {
      timeout: TRANSACTION_WAIT_TIMEOUT_MS,
    })

    expect(typeof result.current.execution.data).toBe('string')

    await waitFor(() => expect(result.current.result.isSuccess).toBeTruthy(), {
      timeout: TRANSACTION_WAIT_TIMEOUT_MS,
    })

    expect(typeof result.current.result.data?.gasUsed).toBe('bigint')
  },
  TRANSACTION_TEST_TIMEOUT_MS
)
