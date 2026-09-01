import {
  dateTimeToUnixTimestampBigInt,
  formatDistanceToNowAbbr,
  unixTimestampToDateTimeLocalString,
} from './time'

describe('unixTimestampToDateTimeLocalString', () => {
  it('formats a unix timestamp for datetime-local inputs in the local timezone', () => {
    // 2026-09-01T18:00:00Z — tests run with TZ=Europe/Madrid (CEST, UTC+2)
    expect(unixTimestampToDateTimeLocalString(1788285600)).toBe('2026-09-01T20:00')
  })

  it('round-trips with dateTimeToUnixTimestampBigInt', () => {
    const unixTimestamp = 1788285600
    const dateTimeLocal = unixTimestampToDateTimeLocalString(unixTimestamp)

    expect(dateTimeToUnixTimestampBigInt(dateTimeLocal)).toBe(BigInt(unixTimestamp))
  })
})

describe('Time distance abbreviated', () => {
  beforeAll(() => {
    vi.setSystemTime(new Date('2025-08-12T10:00:00.000Z')) // Today is Tuesday 12 August 2025 at 10 AM
  })

  it('should return undefined if the date is in the future', () => {
    expect(formatDistanceToNowAbbr(new Date('2025-08-20T10:00:00.000Z'))).toBeUndefined()
  })

  it('should return the formated date if greater than a year', () => {
    expect(formatDistanceToNowAbbr(new Date('2024-08-11T10:00:00.000Z'))).toBe('Aug 11, 2024')
  })

  it('should return months diff between 30 days and a year', () => {
    expect(formatDistanceToNowAbbr(new Date('2024-08-13T10:00:00.000Z'))).toBe('11mo ago')
    expect(formatDistanceToNowAbbr(new Date('2025-03-12T10:00:00.000Z'))).toBe('5mo ago')
    expect(formatDistanceToNowAbbr(new Date('2025-07-12T10:00:00.000Z'))).toBe('1mo ago')
  })

  it('should return days diff between 24 hours and 30 days', () => {
    expect(formatDistanceToNowAbbr(new Date('2025-07-13T10:00:00.000Z'))).toBe('30d ago')
    expect(formatDistanceToNowAbbr(new Date('2025-07-28T10:00:00.000Z'))).toBe('15d ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-11T09:00:00.000Z'))).toBe('1d ago')
  })

  it('should return hours diff between 24 hours and 60 minutes', () => {
    expect(formatDistanceToNowAbbr(new Date('2025-08-11T11:00:00.000Z'))).toBe('23h ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-11T22:00:00.000Z'))).toBe('12h ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T08:59:00.000Z'))).toBe('1h ago')
  })

  it('should return mins diff between 60 minutes and 1 minute', () => {
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:01:00.000Z'))).toBe('59m ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:30:00.000Z'))).toBe('30m ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:58:59.000Z'))).toBe('1m ago')
  })

  it('should return seconds diff if less than 1 minute', () => {
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:59:01.000Z'))).toBe('59s ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:59:30.000Z'))).toBe('30s ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T09:59:59.000Z'))).toBe('1s ago')
    expect(formatDistanceToNowAbbr(new Date('2025-08-12T10:00:00.000Z'))).toBe('0s ago')
  })
})
