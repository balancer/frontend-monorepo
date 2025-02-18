import { oneDayInMs, toJsTimestamp } from '@repo/lib/shared/utils/time'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatDistanceToNow } from 'date-fns'
import { SortingBy } from './myVotes.types'
import BigNumber from "bignumber.js";

export const WEIGHT_VOTE_DELAY = 10 * oneDayInMs

export const WEIGHT_MAX_VOTES = 100

export function bpsToPercentage(weight: string | number) { // 1556n -> 15.56%
  return bn(weight).shiftedBy(-4)
}

export function inputPercentageWeightToBps(weight: string | number) { // 15.557% -> 1556n
  return sharesToBps(bn(weight).toFixed(2, BigNumber.ROUND_HALF_UP))
}

export function sharesToBps(weight: string | number) { // 15.55% -> 1555n
  return bn(weight).shiftedBy(2)
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
      .minus(sharesToBps(WEIGHT_MAX_VOTES))
      .toNumber(),
    0
  )
}

export function getUnallocatedWeight(weight: string | number) {
  return Math.max(
    sharesToBps(WEIGHT_MAX_VOTES)
      .minus(weight)
      .toNumber(),
    0
  )
}

export const orderByHash: Record<SortingBy, { label: string; title?: string }> = {
  bribes: {
    label: 'Bribes',
    title:
      'Voting incentives (referred to as ‘Bribes’ in DeFi) are provided by unaffiliated 3rd parties through the Hidden Hand platform to incentivize liquidity to certain pools.',
  },
  bribesPerVebal: {
    label: 'Bribes/veBAL',
    title:
      'This shows the ratio of 3rd party voting incentives (known as Bribes) to veBAL. The higher this ratio, the more profitable it is to currently vote on this pool. Note this ratio could change up till the voting deadline.',
  },
  currentVotes: {
    label: 'Current votes',
  },
  editVotes: {
    label: 'Edit votes',
  },
}
