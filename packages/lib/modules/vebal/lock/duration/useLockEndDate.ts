import { useToday } from '@repo/lib/shared/hooks/useCurrentDate'
import { useMemo } from 'react'
import { addDays, isThursday, nextThursday, previousThursday, startOfDay } from 'date-fns'
import {
  MAX_LOCK_PERIOD_IN_DAYS,
  MIN_LOCK_PERIOD_IN_DAYS,
} from '@repo/lib/modules/vebal/lock/duration/constants'

export function getMinLockEndDate(date: Date) {
  const minLockTimestamp = addDays(date, MIN_LOCK_PERIOD_IN_DAYS)

  const timestamp = isThursday(minLockTimestamp) ? minLockTimestamp : nextThursday(minLockTimestamp)

  return startOfDay(timestamp)
}

export function getMaxLockEndDate(date: Date) {
  const maxLockTimestamp = addDays(date, MAX_LOCK_PERIOD_IN_DAYS)

  const timestamp = isThursday(maxLockTimestamp)
    ? maxLockTimestamp
    : previousThursday(maxLockTimestamp)

  return startOfDay(timestamp)
}

export interface UseLockEndDateProps {
  lockedEndDate?: Date
}

export function useLockEndDate({ lockedEndDate }: UseLockEndDateProps) {
  const today = useToday()

  const minLockEndDate = useMemo(() => {
    return getMinLockEndDate(lockedEndDate ?? today)
  }, [lockedEndDate, today])

  const maxLockEndDate = useMemo(() => getMaxLockEndDate(today), [today])

  return { minLockEndDate, maxLockEndDate }
}
