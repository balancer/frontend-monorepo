import { nextThursday } from 'date-fns'

export function nextVotingDeadline() {
  return new Date(nextThursday(new Date()).setUTCHours(0, 0, 0, 0))
}
