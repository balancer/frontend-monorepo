import { useEffect, useMemo, useState } from 'react'
import { oneMinInMs } from '@repo/lib/shared/utils/time'
import { startOfDay } from 'date-fns'

/**
 * Returns actual (autoupdated) new Date()
 * @param interval - Autoupdate interval in ms (default: 1 min)
 */
export function dateHooks(interval = oneMinInMs) {
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
 * @description Actually updates once per 24h, when new day (tomorrow) begins
 * @param interval
 */
export function useToday(interval = oneMinInMs) {
  const currentDate = dateHooks(interval)
  const today = startOfDay(currentDate).getTime()
  return useMemo(() => new Date(today), [today])
}
