import { oneDayInMs, toJsTimestamp } from '@repo/lib/shared/utils/time'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatDistanceToNow } from 'date-fns'

export const WEIGHT_VOTE_DELAY = 10 * oneDayInMs

export const WEIGHT_MAX_VOTES = 100

export function bpsToPercentage(weight: string | number) {
  return bn(weight).shiftedBy(-4)
}

export function sharesToBps(weight: string | number) {
  return bn(weight).shiftedBy(4)
}

export function isVotingTimeLocked(lastVoteTime: number) {
  const lastUserVoteTime = toJsTimestamp(lastVoteTime)
  return Date.now() < lastUserVoteTime + WEIGHT_VOTE_DELAY
}

export function votingTimeLockedEndDate(lastVoteTime: number) {
  const lastUserVoteTime = toJsTimestamp(lastVoteTime)
  return new Date(lastUserVoteTime + WEIGHT_VOTE_DELAY)
}

export function remainingVoteLockTime(lastVoteTime: number): string {
  const lastUserVoteTime = toJsTimestamp(lastVoteTime)
  return formatDistanceToNow(lastUserVoteTime + WEIGHT_VOTE_DELAY)
}

export function getExceededWeight(weight: string | number) {
  return Math.max(
    bn(weight)
      .minus(sharesToBps(WEIGHT_MAX_VOTES / 100))
      .toNumber(),
    0
  )
}

export function getUnallocatedWeight(weight: string | number) {
  return Math.max(
    sharesToBps(WEIGHT_MAX_VOTES / 100)
      .minus(weight)
      .toNumber(),
    0
  )
}
