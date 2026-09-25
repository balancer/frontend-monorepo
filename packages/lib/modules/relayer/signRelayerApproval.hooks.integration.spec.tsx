import {
  DefaultAddLiquidityTestProvider,
  DefaultPoolTestProvider,
  testHook,
} from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { PropsWithChildren, act } from 'react'
import { useSignRelayerApproval } from './signRelayerApproval.hooks'
import { useRelayerSignature } from './RelayerSignatureProvider'
import { connectWithDefaultUser } from '@repo/test/utils/wagmi/wagmi-connections'
import { SONIC_CHAIN_ID } from '@repo/lib/test/integration/sonic-fixtures'

function Providers({ children }: PropsWithChildren) {
  return (
    <DefaultPoolTestProvider>
      <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
    </DefaultPoolTestProvider>
  )
}

test('Signs relayer approval and saves signature in the addLiquidity provider state', async () => {
  await connectWithDefaultUser()

  const { result } = testHook(
    () => {
      const { relayerApprovalSignature } = useRelayerSignature()
      const signResult = useSignRelayerApproval(SONIC_CHAIN_ID)
      return { ...signResult, relayerApprovalSignature }
    },
    {
      wrapper: Providers,
    }
  )

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  await act(() => result.current.signRelayer())

  expect(result.current.relayerApprovalSignature).toBeDefined()
})
