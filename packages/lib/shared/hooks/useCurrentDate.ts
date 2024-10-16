import { useEffect, useMemo, useState } from 'react'
import { oneMinInMs } from '@repo/lib/shared/utils/time'
import { startOfDay } from 'date-fns'

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

export function useToday(interval = oneMinInMs) {
  const currentDate = useCurrentDate(interval)
  const today = startOfDay(currentDate).getTime()
  return useMemo(() => new Date(today), [today])
}
