import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useContractWallet } from './useContractWallet'
import { waitFor } from '@testing-library/react'
import {
  connectWith,
  connectWithDefaultUser,
  disconnectDefaultUser,
} from '@repo/test/utils/wagmi/wagmi-connections'

const TEST_EOA_ADDRESS = '0x71e3aae9588c928ed01590bcac4d3d6a8c70550c'

describe('Smart contract wallets', () => {
  it('should return false when no wallet is connected', async () => {
    await disconnectDefaultUser()

    const { result } = testHook(() => useContractWallet())
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.isContractWallet).toBe(false)
  })

  it('should return false when EOA wallet', async () => {
    await connectWith(TEST_EOA_ADDRESS)

    const { result } = testHook(() => useContractWallet())
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.isContractWallet).toBe(false)
  })

  it('should return true when contract wallet', async () => {
    // Default test user for Anvil is has an underlying contract
    await connectWithDefaultUser()

    const { result } = testHook(() => useContractWallet())
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.isContractWallet).toBe(true)
  })
})
