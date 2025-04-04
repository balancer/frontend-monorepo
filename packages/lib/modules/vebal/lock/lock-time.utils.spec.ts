import { getMinLockEndDate, getMaxLockEndDate } from './lock-time.utils'

describe('getMinLockEndDate', () => {
  // Use fake timers to control Date.now() and new Date()
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getMinLockEndDate should return the start of the next Thursday after today + 7 days', () => {
    it('when today is Wednesday', () => {
      vi.setSystemTime(new Date('2025-04-02T10:00:00.000Z')) // Wed 2 April 2025 at 10 AM

      const today = new Date()
      const result = getMinLockEndDate(today)

      // 2 April + 7 days = 9 April (Wed) and 10 April is the next Thursday
      expect(result.toISOString()).toBe('2025-04-10T00:00:00.000Z')
    })

    it('when today is Thursday', () => {
      vi.setSystemTime(new Date('2025-04-03T00:01:00.000Z')) // Thursday 3 April 2025 at 00:01 AM

      const today = new Date()
      const result = getMinLockEndDate(today)

      expect(result.toISOString()).toBe('2025-04-10T00:00:00.000Z')
    })

    it('when today is Friday', () => {
      vi.setSystemTime(new Date('2025-04-04T05:00:00.000Z')) // Friday 4 April 2025 at 5 AM

      const today = new Date()
      const result = getMinLockEndDate(today)

      expect(result.toISOString()).toBe('2025-04-17T00:00:00.000Z')
    })
  })

  describe('getMaxLockEndDate should return the start of the previous Thursday before today + 1 year', () => {
    it('when today is Wednesday', () => {
      const lockedEndDate = new Date('2025-04-02:08:00.000Z') // Wed 2 Apr 2025

      const result = getMaxLockEndDate(lockedEndDate)

      expect(result.toISOString()).toBe('2026-04-02T00:00:00.000Z')
    })

    it('when today is Thursday', () => {
      const lockedEndDate = new Date('2025-04-03T00:00:00.000Z') // Thursday 3 April 2025

      const result = getMaxLockEndDate(lockedEndDate)

      expect(result.toISOString()).toBe('2026-04-02T00:00:00.000Z')
    })

    it('when today is Friday', () => {
      const lockedEndDate = new Date('2025-04-05T10:00:00.000Z') // Friday 4 April 2025

      const result = getMaxLockEndDate(lockedEndDate)

      expect(result.toISOString()).toBe('2026-04-02T00:00:00.000Z')
    })
  })
})
