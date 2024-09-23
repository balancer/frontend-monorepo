import {
  DefaultAddLiquidityTestProvider,
  DefaultPoolTestProvider,
  testHook,
} from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'
import { act } from 'react-dom/test-utils'
import { useSignRelayerApproval } from './signRelayerApproval.hooks'
import { useRelayerSignature } from './RelayerSignatureProvider'
import { connectWithDefaultUser } from '../../../test/utils/wagmi/wagmi-connections'

const Providers = ({ children }: PropsWithChildren) => (
  <DefaultPoolTestProvider>
    <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
  </DefaultPoolTestProvider>
)

test('Signs relayer approval and saves signature in the addLiquidity provider state', async () => {
  await connectWithDefaultUser()

  const { result } = testHook(
    () => {
      const { relayerApprovalSignature } = useRelayerSignature()
      const mainnetId = 1
      const signResult = useSignRelayerApproval(mainnetId)
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
