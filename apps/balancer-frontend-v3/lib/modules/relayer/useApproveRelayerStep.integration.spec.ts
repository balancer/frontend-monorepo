import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { connectWithDefaultUser } from '../../../test/utils/wagmi/wagmi-connections'
import { useApproveRelayerStep } from './useApproveRelayerStep'
import { TransactionStateProvider } from '../transactions/transaction-steps/TransactionStateProvider'

test('Runs relayer approval transaction and queries that it was approved', async () => {
  await connectWithDefaultUser()

  const { result } = testHook(() => useApproveRelayerStep(1), {
    wrapper: TransactionStateProvider,
  })

  await waitFor(() => expect(result.current.step.stepType).toBe('approveBatchRelayer'))
})
