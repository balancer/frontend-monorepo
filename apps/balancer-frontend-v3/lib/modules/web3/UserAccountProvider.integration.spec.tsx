import { alternativeTestUserAccount } from '@/test/anvil/anvil-setup'
import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import {
  connectWithAlternativeUser,
  disconnectAlternativeUser,
} from '../../../test/utils/wagmi/wagmi-connections'
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
