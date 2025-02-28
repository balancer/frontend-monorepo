import { StaticCalendar } from '@repo/lib/shared/components/calendar/StaticCalendar'
import { useToday } from '@repo/lib/shared/hooks/date.hooks'
import { addWeeks, endOfWeek, isSameDay, nextThursday, startOfDay, startOfWeek } from 'date-fns'
import { useCallback } from 'react'
import { VotingDeadlineContainer } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineContainer'

export function VotingDeadlineCalendar() {
  const today = useToday()

  const startDate = startOfWeek(today)
  const endDate = endOfWeek(addWeeks(today, 1))
  const deadlineDate = nextThursday(today) // fixme: calculate exact time

  const isDayDisabled = useCallback(
    (day: Date) => {
      return day < startOfDay(today)
    },
    [today]
  )

  const isDayActive = useCallback(
    (day: Date) => {
      return isSameDay(day, deadlineDate)
    },
    [deadlineDate]
  )

  const isDaySelected = useCallback(
    (day: Date) => {
      return isSameDay(day, addWeeks(deadlineDate, 1))
    },
    [deadlineDate]
  )

  return (
    <VotingDeadlineContainer>
      <StaticCalendar
        endDate={endDate}
        isDayActive={isDayActive}
        isDayDisabled={isDayDisabled}
        isDaySelected={isDaySelected}
        startDate={startDate}
      />
    </VotingDeadlineContainer>
  )
}
