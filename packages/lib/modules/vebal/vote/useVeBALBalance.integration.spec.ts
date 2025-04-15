import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { useVeBALBalance } from './useVeBALBalance'

const ACCOUNT_WITHOUT_VEBAL = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
const ACCOUNT_WITH_VEBAL = '0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'

function testUseUserVeBal(address: `0x${string}`) {
  const { result } = testHook(() => useVeBALBalance(address))
  return result
}

describe('returns the veBAL balance of the user when', () => {
  test('user has no veBal', async () => {
    const result = testUseUserVeBal(ACCOUNT_WITHOUT_VEBAL)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.veBALBalance).toBe(0n)
  })

  test('user has veBal', async () => {
    const result = testUseUserVeBal(ACCOUNT_WITH_VEBAL)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.veBALBalance).toBeGreaterThan(0n)
  })
})
