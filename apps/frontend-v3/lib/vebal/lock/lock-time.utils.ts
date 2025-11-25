import { startOfDayUtc, toUtcTime } from '@repo/lib/shared/utils/time'
import { addDays, addHours, isThursday, nextThursday, previousThursday } from 'date-fns'
import {
  MAX_LOCK_PERIOD_IN_DAYS,
  MIN_LOCK_PERIOD_IN_DAYS,
} from './duration/lock-duration.constants'

export function getMinLockEndDateTimestamp(hasExistingLock: boolean, lockedEndDate = 0) {
  const todaysDate = toUtcTime(new Date())
  return startOfDayUtc(
    nextThursday(addDays(hasExistingLock ? lockedEndDate : todaysDate, MIN_LOCK_PERIOD_IN_DAYS))
  ).getTime()
}

export function getMinLockEndDateFoo(hasExistingLock: boolean, lockedEndDate = 0) {
  const todaysDate = toUtcTime(new Date())
  return startOfDayUtc(
    nextThursday(addDays(hasExistingLock ? lockedEndDate : todaysDate, MIN_LOCK_PERIOD_IN_DAYS))
  )
}

export function getMinLockEndDate(date: Date) {
  const minLockTimestamp = addDays(date, MIN_LOCK_PERIOD_IN_DAYS)

  const timestamp = isThursday(minLockTimestamp) ? minLockTimestamp : nextThursday(minLockTimestamp)

  return startOfDayUtc(timestamp)
}

export function getMaxLockEndDate(date: Date) {
  const maxLockTimestamp = addDays(date, MAX_LOCK_PERIOD_IN_DAYS)

  const timestamp = isThursday(maxLockTimestamp)
    ? maxLockTimestamp
    : // HACK: There is a bug in the previousThursday function, when having
      // "Tue Oct 27 2026 01:00:00 GMT+0100 (Central European Standard Time)"
      // as input the reponse is (due to daylight savings)
      // "Thu Oct 22 2026 01:00:00 GMT+0200 (Central European Summer Time)"
      // when is should be (so we can operate in UTC times correctly)
      // "Thu Oct 22 2026 02:00:00 GMT+0200 (Central European Summer Time)"
      // To fix this problem, as we are starting with the date as begining of today UTC
      // we add a couple of hours
      // Related issue: https://github.com/date-fns/date-fns/issues/4086
      previousThursday(addHours(maxLockTimestamp, 2))

  return startOfDayUtc(timestamp)
}
