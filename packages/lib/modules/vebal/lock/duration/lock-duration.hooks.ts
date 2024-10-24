import { useToday } from '@repo/lib/shared/hooks/useCurrentDate'
import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  addWeeks,
  differenceInMonths,
  differenceInWeeks,
  format,
  isEqual,
  startOfDay,
} from 'date-fns'
import { range } from 'lodash'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/constants'
import { UseVebalLockInfoResult } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'
import {
  getMinLockEndDate,
  useLockEndDate,
  UseLockEndDateProps,
} from '@repo/lib/modules/vebal/lock/duration/useLockEndDate'

export interface UseLockDurationProps extends UseLockEndDateProps {
  initialValue?: number
  mainnetLockedInfo: UseVebalLockInfoResult['mainnetLockedInfo']
}

export type UseLockDurationResult = ReturnType<typeof useLockDuration>

export function useLockDuration({
  initialValue = 0,
  lockedEndDate,
  mainnetLockedInfo,
}: UseLockDurationProps) {
  const today = useToday()

  const { minLockEndDate, maxLockEndDate } = useLockEndDate({ lockedEndDate })

  const sliderMinDate = useMemo(() => getMinLockEndDate(today), [today])
  const sliderMaxDate = maxLockEndDate

  const minSliderValue = useMemo(() => {
    if (!lockedEndDate) return undefined
    return lockedEndDate > sliderMinDate
      ? differenceInWeeks(lockedEndDate, sliderMinDate)
      : undefined
  }, [lockedEndDate, sliderMinDate])

  const [sliderValue, setSliderValue] = useState(() => minSliderValue ?? initialValue)

  const onSliderChange = (val: number) => setSliderValue(val)

  useEffect(() => {
    if (typeof minSliderValue !== 'undefined') {
      setSliderValue(prevValue => {
        const minValue = minSliderValue
        if (prevValue < minValue) {
          return minValue
        }
        return prevValue
      })
    }
  }, [minSliderValue])

  const minStep = 0
  const maxStep = differenceInWeeks(sliderMaxDate, sliderMinDate, { roundingMethod: 'ceil' })
  const stepSize = 1

  const lockEndDate = useMemo(() => {
    const value = startOfDay(addWeeks(sliderMinDate, sliderValue))

    if (value >= sliderMaxDate) {
      return sliderMaxDate
    }

    return value
  }, [sliderMinDate, sliderValue, sliderMaxDate])

  const steps = useMemo(() => {
    const months = differenceInMonths(sliderMaxDate, sliderMinDate)
    const weeks = differenceInWeeks(sliderMaxDate, sliderMinDate)

    return range(0, months + 1)
      .map(v => addMonths(sliderMinDate, v))
      .map(
        v => (weeks * (Number(v) - Number(today))) / (Number(sliderMaxDate) - Number(sliderMinDate))
      )
  }, [today, sliderMinDate, sliderMaxDate])

  const lockUntilDateFormatted = format(lockEndDate, PRETTY_DATE_FORMAT)

  const isValidLockEndDate = useMemo(
    () => lockEndDate >= minLockEndDate && lockEndDate <= maxLockEndDate,
    [lockEndDate, maxLockEndDate, minLockEndDate]
  )

  const isExtendedLockEndDate = useMemo(
    () => mainnetLockedInfo?.hasExistingLock && isValidLockEndDate,
    [mainnetLockedInfo, isValidLockEndDate]
  )

  const lockUntilDateDuration = useMemo(() => {
    if (isEqual(lockEndDate, sliderMaxDate)) {
      return '~1 year'
    }

    const weeksValue = differenceInWeeks(lockEndDate, today, { roundingMethod: 'ceil' })

    const months = differenceInMonths(lockEndDate, today)

    if (months >= 2) {
      return `~${months} months`
    }

    if (months >= 1) {
      return `~${months} month`
    }

    return `~${weeksValue} weeks`
  }, [lockEndDate, sliderMaxDate, today])

  return {
    minLockEndDate,
    maxLockEndDate,
    minSliderValue,
    sliderValue,
    onSliderChange,
    steps,
    minStep,
    maxStep,
    stepSize,
    lockEndDate,
    lockUntilDateDuration,
    lockUntilDateFormatted,
    isValidLockEndDate,
    isExtendedLockEndDate,
  }
}
