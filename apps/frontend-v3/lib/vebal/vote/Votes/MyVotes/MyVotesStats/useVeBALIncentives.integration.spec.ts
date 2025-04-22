import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useVeBALIncentives } from './useVeBALIncentives'
import { waitFor } from '@testing-library/react'

describe('VeBAL incentives hook', () => {
  it('should return the voting incentives', async () => {
    const { result } = testHook(() => useVeBALIncentives(''))
    await waitFor(() => expect(result.current.incentivesAreLoading).toBeFalsy())

    const incentives = result.current.incentives
    expect(incentives.voting).toBeDefined()
    if (incentives.voting) expect(incentives.voting > 0).toBe(true)
  })
})
