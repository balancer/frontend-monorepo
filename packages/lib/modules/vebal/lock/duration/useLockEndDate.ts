import { useToday } from '@repo/lib/shared/hooks/date.hooks'
import { getMaxLockEndDate, getMinLockEndDate } from '../lock-time.utils'
import { useMemo } from 'react'

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
