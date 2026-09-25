import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { useApproveRelayerStep } from './useApproveRelayerStep'
import { TransactionStateProvider } from '../transactions/transaction-steps/TransactionStateProvider'
import { SONIC_CHAIN_ID } from '@repo/lib/test/integration/sonic-fixtures'

test('Runs relayer approval transaction and queries that it was approved', async () => {
  await connectWithDefaultUser()

  const { result } = testHook(() => useApproveRelayerStep(SONIC_CHAIN_ID), {
    wrapper: TransactionStateProvider,
  })

  await waitFor(() => expect(result.current.step.stepType).toBe('approveBatchRelayer'))
})
