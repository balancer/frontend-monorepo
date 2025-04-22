import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useVeBALTotal } from './useVeBALTotal'
import { oneWeekInMs } from '@repo/lib/shared/utils/time'
import { waitFor } from '@testing-library/react'

describe('VeBAL total custom hook', () => {
  it('should return the current amount of VeBAL', async () => {
    const now = Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs

    const { result } = testHook(() => useVeBALTotal(now))
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    const totalAmount = result.current.totalAmount
    expect(totalAmount).toBeDefined()
    if (totalAmount) expect(totalAmount > 0).toBe(true)
  })
})
