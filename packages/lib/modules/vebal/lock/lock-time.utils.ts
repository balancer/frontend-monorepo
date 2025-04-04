import { startOfDayUtc, toUtcTime } from '@repo/lib/shared/utils/time'
import { addDays, isThursday, nextThursday, previousThursday } from 'date-fns'
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
    : previousThursday(maxLockTimestamp)

  return startOfDayUtc(timestamp)
}
