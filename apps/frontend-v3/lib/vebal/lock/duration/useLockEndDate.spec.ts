import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useLockEndDate } from './useLockEndDate'

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

function testUseLockEndDate(lockedEndDate: Date | undefined) {
  const { result } = testHook(() =>
    useLockEndDate({
      lockedEndDate,
    })
  )
  return result
}

test('useLockEndDate with existing lock', () => {
  vi.setSystemTime(new Date('2025-04-04T10:00:00.000Z')) // Today is Friday 4 April 2025 at 10 AM
  const lockedEndDate = new Date('2025-04-17:10:00.000Z') // Thursday 17 April 2025 at 10AM

  const result = testUseLockEndDate(lockedEndDate)

  expect(result.current).toEqual({
    maxLockEndDate: new Date('2026-04-02T00:00:00.000Z'), // Previous Thursday after 1 year
    minLockEndDate: new Date('2025-04-24T00:00:00.000Z'), // Next Thursday
  })
})

test('useLockEndDate with no current lock', () => {
  vi.setSystemTime(new Date('2025-04-04T10:00:00.000Z')) // Fri 4 April 2025 at 10 AM

  const { result } = testHook(() =>
    useLockEndDate({
      lockedEndDate: undefined,
    })
  )
  expect(result.current).toEqual({
    maxLockEndDate: new Date('2026-04-02T00:00:00.000Z'), // Previous Thursday after 1 year
    minLockEndDate: new Date('2025-04-17T00:00:00.000Z'), // Next Thursday
  })
})
