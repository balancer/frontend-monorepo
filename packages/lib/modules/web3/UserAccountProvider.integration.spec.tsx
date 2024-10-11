import { alternativeTestUserAccount } from '@repo/lib/test/anvil/anvil-setup'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import {
  connectWithAlternativeUser,
  disconnectAlternativeUser,
} from '@repo/lib/test/utils/wagmi/wagmi-connections'
import { useUserAccount } from './UserAccountProvider'

function testUseUserAccount() {
  const { result } = testHook(() => useUserAccount())
  return result
}

test('connects with alternative test user account', async () => {
  await connectWithAlternativeUser()
  const result = testUseUserAccount()
  await waitFor(() => expect(result.current.userAddress).toBe(alternativeTestUserAccount))
  await disconnectAlternativeUser()
})
