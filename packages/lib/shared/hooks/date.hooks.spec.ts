import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { addDays, addHours, addMinutes, addSeconds } from 'date-fns'
import { useDateCountdown } from './date.hooks'
import { act } from 'react-dom/test-utils'

describe('Countdown hook', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should return remaining difference in secs', async () => {
    const now = new Date('2025-04-04T10:00:00.000Z')
    const timeMachine = vi.setSystemTime(now)
    const deadline = addSeconds(now, 10)

    const { result } = testHook(() => useDateCountdown(deadline))
    expect(result.current.secondsDiff).toBe(10)

    await act(async () => timeMachine.advanceTimersByTime(2 * 1000))

    expect(result.current.secondsDiff).toBe(8)
  })

  it('should return remaining difference in minutes', async () => {
    const now = new Date('2025-04-04T10:00:00.000Z')
    const timeMachine = vi.setSystemTime(now)
    const deadline = addMinutes(now, 10)

    const { result } = testHook(() => useDateCountdown(deadline))
    expect(result.current.minutesDiff).toBe(10)

    await act(async () => timeMachine.advanceTimersByTime(2 * 60 * 1000))

    expect(result.current.minutesDiff).toBe(8)
  })

  it('should return remaining difference in hours', async () => {
    const now = new Date('2025-04-04T10:00:00.000Z')
    const timeMachine = vi.setSystemTime(now)
    const deadline = addHours(now, 10)

    const { result } = testHook(() => useDateCountdown(deadline))
    expect(result.current.hoursDiff).toBe(10)

    await act(async () => timeMachine.advanceTimersByTime(2 * 60 * 60 * 1000))

    expect(result.current.hoursDiff).toBe(8)
  })

  it('should return remaining difference in days', async () => {
    const now = new Date('2025-04-04T10:00:00.000Z')
    const timeMachine = vi.setSystemTime(now)
    const deadline = addDays(now, 10)

    const { result } = testHook(() => useDateCountdown(deadline))
    expect(result.current.daysDiff).toBe(10)

    await act(async () => timeMachine.advanceTimersByTime(2 * 24 * 60 * 60 * 1000))

    expect(result.current.daysDiff).toBe(8)
  })
})
