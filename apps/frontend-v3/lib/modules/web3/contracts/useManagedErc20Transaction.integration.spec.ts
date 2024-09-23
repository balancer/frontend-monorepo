import { TransactionLabels } from '@/lib/modules/transactions/transaction-steps/lib'
import { testHook } from '@/test/utils/custom-renderers'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { Address, parseUnits } from 'viem'
import { useManagedErc20Transaction } from './useManagedErc20Transaction'

await connectWithDefaultUser()

test('token approval transaction (wETH)', async () => {
  const wEthAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

  const vault2 = '0xBA12222222228d8Ba445958a75a0704d566BF2C8' as Address
  const chainId = 1

  const { result } = testHook(() =>
    useManagedErc20Transaction({
      chainId,
      tokenAddress: wEthAddress as Address,
      functionName: 'approve',
      args: [vault2, parseUnits('100', 18)],
      enabled: true,
      simulationMeta: {},
      labels: {} as TransactionLabels,
    })
  )

  await waitFor(() => expect(result.current.simulation.isSuccess).toBeTruthy())

  await act(() => result.current.executeAsync())

  await waitFor(() => expect(result.current.execution.isSuccess).toBeTruthy())

  expect(typeof result.current.execution.data).toBe('string')

  await waitFor(() => expect(result.current.result.isSuccess).toBeTruthy())

  expect(typeof result.current.result.data?.gasUsed).toBe('bigint')
})
