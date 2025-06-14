import { sub, millisecondsToSeconds, secondsToMilliseconds } from 'date-fns'

export const oneSecondInMs = 1000
export const oneMinInMs = 60 * oneSecondInMs
export const oneHourInMs = 60 * oneMinInMs
export const oneDayInMs = 24 * oneHourInMs
export const oneWeekInMs = 7 * oneDayInMs

export const oneSecond = 1
export const oneMinInSecs = 60 * oneSecond
export const oneHourInSecs = 60 * oneMinInSecs

export const twentyFourHoursInMs = 24 * oneHourInMs
export const twentyFourHoursInSecs = twentyFourHoursInMs / oneSecondInMs

export const timeNowInMs = Math.floor(Date.now() / oneSecondInMs)

export const oneYearInSecs = twentyFourHoursInSecs * 365
export const oneWeekInSecs = twentyFourHoursInSecs * 7

export function hours(hrs: number) {
  return {
    toSecs: () => hrs * oneHourInSecs,
  }
}

export function mins(_mins: number) {
  return {
    toSecs: () => _mins * oneMinInSecs,
    toMs: () => _mins * oneMinInMs,
  }
}

export function secs(_secs: number) {
  return {
    toMs: () => _secs * oneSecondInMs,
  }
}

export function ms(_ms: number) {
  return {
    toSecs: () => _ms / oneSecondInMs,
  }
}

export function dateTimeLabelFor(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZoneName: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDateTimeShort(date: Date): string {
  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
  const dateStr = date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  })
  return `${time}, ${dateStr}`
}

export function toJsTimestamp(unixTimestamp: number): number {
  return unixTimestamp * oneSecondInMs
}

export function toUnixTimestamp(jsTimestamp: number): number {
  return Math.round(jsTimestamp / oneSecondInMs)
}

/**
 * Converts a the given string (format 2022-03-30) into a UNIX timestamp
 *
 * @param {string} date - Date string in format 2022-03-30
 * @returns {number} - Unix timestamp in seconds
 */
export function dateToUnixTimestamp(date: string): number {
  return Date.parse(date) / oneSecondInMs
}

export function toUtcTime(date: Date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

export function getPreviousThursday(date: Date = new Date()): Date {
  let daysSinceThursday = date.getDay() - 4
  if (daysSinceThursday < 0) daysSinceThursday += 7

  return sub(date, {
    days: daysSinceThursday,
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  })
}

export function getTimestampSecondsFromNow(secs: number): number {
  return Math.ceil(Date.now() / 1000) + secs
}

export function getNowTimestampInSecs(): number {
  return Math.floor(Date.now() / 1000)
}

export function getTimestampInMinsFromNow(mins: number) {
  const nowInSecs = Date.now() / 1000
  const secondsToAdd = mins * 60
  return Math.floor(nowInSecs + secondsToAdd)
}

/**
 * Get seconds since given timestamp.
 *
 * @param {number} timestamp - Unix timestamp in seconds.
 */
export function getSecondsSince(timestamp: number): number {
  return Math.ceil(Date.now() / 1000) - timestamp
}

export function getTimestamp() {
  return {
    minsAgo: (minutes: number) => sub(millisecondsToSeconds(new Date().getTime()), { minutes }),
  }
}

export function get24HoursFromNowInSecs() {
  return getTimestampInMinsFromNow(24 * 60)
}

/*
  Get start of day in UTC timezone
*/
export function startOfDayUtc(dateUTC: Date) {
  return new Date(
    Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), 0, 0, 0, 0)
  )
}

export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

/**
 * Fixes date shown on pool charts
 *
 * @param {number} unixTimestamp - Unix timestamp from API uses seconds
 * @returns {number} - Timestamp aligned with local day
 */
export function alignUtcWithLocalDay(unixTimestamp: number) {
  const utcDate = new Date(secondsToMilliseconds(unixTimestamp))
  const timezoneOffset = utcDate.getTimezoneOffset() * oneMinInSecs // convert getTimezoneOffset from minutes to seconds
  return unixTimestamp + timezoneOffset
}

// Using a specialized function so it can be mocked when testing manually
export function now() {
  return new Date()
}
