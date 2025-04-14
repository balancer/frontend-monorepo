import { addWeeks, endOfWeek, nextThursday, startOfWeek } from 'date-fns'
import { VotingDeadlineContainer } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineContainer'
import { StaticCalendar } from './StaticCalendar'

export function VotingDeadlineCalendar() {
  const nowWithoutTime = new Date().setUTCHours(0, 0, 0, 0)
  const deadline = nextThursday(nowWithoutTime)

  const startDate = startOfWeek(deadline)
  const endDate = endOfWeek(addWeeks(deadline, 1))

  return (
    <VotingDeadlineContainer>
      <StaticCalendar deadline={deadline} endDate={endDate} startDate={startDate} />
    </VotingDeadlineContainer>
  )
}
