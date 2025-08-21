import { addWeeks, endOfWeek, startOfWeek } from 'date-fns'
import { VotingDeadlineContainer } from './VotingDeadlineContainer'
import { StaticCalendar } from './StaticCalendar'
import { nextVotingDeadline } from './deadline'

export function VotingDeadlineCalendar() {
  const deadline = nextVotingDeadline()
  const startDate = startOfWeek(deadline)
  const endDate = endOfWeek(addWeeks(deadline, 1))

  return (
    <VotingDeadlineContainer>
      <StaticCalendar deadline={deadline} endDate={endDate} startDate={startDate} />
    </VotingDeadlineContainer>
  )
}
