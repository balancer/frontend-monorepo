import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useLockDuration } from './useLockDuration'

// Use fake timers to control Date.now() and new Date()
beforeEach(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

const lockedEndDate = new Date('2025-04-10:10:00.000Z') // Thursday 10 April 2025 at 10AM
const lockedEndDateTimestamp: number = lockedEndDate.getTime()

function testUseLockDuration() {
  const { result } = testHook(() =>
    useLockDuration({
      lockedEndDate,
      mainnetLockedInfo: {
        lockedEndDate: lockedEndDateTimestamp,
        lockedAmount: '10',
        hasExistingLock: false,
        isExpired: false,
        epoch: '0',
        totalSupply: '100',
      },
    })
  )
  return result
}

test('lockDuration returns expected slider values', () => {
  vi.setSystemTime(new Date('2025-04-04T10:00:00.000Z')) // Today is Friday 4 April 2025 at 10 AM

  const result = testUseLockDuration()

  expect(result.current).toMatchObject({
    isExtendedLockEndDate: false,
    isValidLockEndDate: true,
    lockUntilDateDuration: '~1 year',
    lockUntilDateFormatted: '2 Apr 2026',
    lockedUntilDateFormatted: '10 Apr 2025',
    minLockEndDate: new Date('2025-04-17T00:00:00.000Z'), // 2 weeks from now
    lockEndDate: new Date('2026-04-02T00:00:00.000Z'), // 1 year from now
    maxLockEndDate: new Date('2026-04-02T00:00:00.000Z'), // 1 year from now
    maxStep: 50,
    minSliderValue: undefined,
    minStep: 0,
    sliderValue: 50,
    stepSize: 1,
    steps: expect.any(Array),
  })
})
