import { useEffect, useMemo, useState } from 'react'
import { oneMinInMs, oneSecondInMs, startOfDayUtc } from '@repo/lib/shared/utils/time'
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns'

/**
 * Returns actual (autoupdated) new Date()
 * @param interval - Autoupdate interval in ms (default: 1 min)
 */
export function useCurrentDate(interval = oneMinInMs) {
  const [date, setDate] = useState(() => new Date())

  useEffect(() => {
    if (interval > 0) {
      const intervalId = setInterval(() => {
        setDate(new Date())
      }, interval)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [interval])

  return date
}

/**
 * Returns actual (autoupdated) start of day
 * @description Is updated once per 24h, when new day (tomorrow) begins
 * @param interval
 */
export function useToday(interval = oneMinInMs) {
  const currentDate = useCurrentDate(interval)
  const today = startOfDayUtc(currentDate).getTime()
  return useMemo(() => new Date(today), [today])
}

export function useFakeTime() {
  const [isFakeTime, setIsFakeTime] = useState(false)

  return {
    isFakeTime,
    setIsFakeTime,
  }
}

/**
 * Return the difference (in days, hours, mins and secs) to a given
 * deadline. It will be autoupdated each second
 */
export function useDateCountdown(deadline: Date) {
  const now = useCurrentDate(oneSecondInMs)

  const daysDiff = differenceInDays(deadline, now)
  const hoursDiff = differenceInHours(deadline, now) - daysDiff * 24
  const minutesDiff = differenceInMinutes(deadline, now) - differenceInHours(deadline, now) * 60
  const secondsDiff = differenceInSeconds(deadline, now) - differenceInMinutes(deadline, now) * 60

  return {
    daysDiff,
    hoursDiff,
    minutesDiff,
    secondsDiff,
  }
}
