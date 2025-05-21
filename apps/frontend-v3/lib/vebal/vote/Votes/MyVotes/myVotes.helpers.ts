import { oneDayInMs, startOfDayUtc, toJsTimestamp } from '@repo/lib/shared/utils/time'
import { bn, Numberish } from '@repo/lib/shared/utils/numbers'
import { formatDistanceToNow, millisecondsToSeconds, nextThursday } from 'date-fns'
import { SortingBy } from './myVotes.types'
import BigNumber from 'bignumber.js'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { formatUnits } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getGqlChain } from '@repo/lib/config/app.config'

export const WEIGHT_VOTE_DELAY = 10 * oneDayInMs

export const WEIGHT_MAX_VOTES = 100

export function bpsToPercentage(weight: Numberish) {
  // 1556n -> 15.56%
  return bn(weight).shiftedBy(-4)
}

export function inputPercentageWeightToBps(weight: string | number) {
  // 15.557% -> 1556n
  return sharesToBps(bn(weight).toFixed(2, BigNumber.ROUND_HALF_UP))
}

export function sharesToBps(weight: string | number) {
  // 15.55% -> 1555n
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

export function getExceededWeight(weight: Numberish) {
  return BigNumber.max(bn(weight).minus(sharesToBps(WEIGHT_MAX_VOTES)), 0)
}

export function getUnallocatedWeight(weight: Numberish) {
  return BigNumber.max(sharesToBps(WEIGHT_MAX_VOTES).minus(weight), 0)
}

// Bribes for voted Vote (based on defilytica - HH Rewards)
// see: https://github.com/defilytica/balancer-tools-v2/blob/63b035b09efbe452eb2bd4fd9e2e0fc920745765/src/pages/VeBALVoter/index.tsx#L394
export function calculateMyVoteRewardsValue(
  newWeight: string | number,
  votingPool: VotingPoolWithData,
  slope: bigint,
  lockEnd: number | undefined,
  totalVotes: bigint,
  blacklistedVotes: BigNumber = bn(0),
  priceFor: (address: string, chain: GqlChain) => number
) {
  const votingPower = calculateVotingPower(slope, lockEnd)
  const oldWeight = votingPool.gaugeVotes?.userVotes || '0'
  const currentUserVotes = votingPower.times(bpsToPercentage(oldWeight))
  const newUserVotes = votingPower.times(bpsToPercentage(newWeight))

  const poolVoteCount = bn(formatUnits(totalVotes, 18))
    .times(bn(votingPool.gaugeVotes?.votesNextPeriod || 0n).shiftedBy(-18))
    .minus(blacklistedVotes.shiftedBy(-18))

  const incentivesInfo = votingPool?.votingIncentive?.bribes[0]
  if (!incentivesInfo) return bn(0)

  const incentiveTokenPrice = bn(
    priceFor(incentivesInfo.token, getGqlChain(incentivesInfo.chainId))
  )
  const totalIncentives = incentiveTokenPrice.times(incentivesInfo.amount)

  const newPoolVoteCount = bn(poolVoteCount).minus(currentUserVotes).plus(newUserVotes)
  const maxValuePerVote = incentiveTokenPrice.times(incentivesInfo.maxTokensPerVote)
  const expectedValuePerVote = bn(totalIncentives).div(newPoolVoteCount)
  const valuePerVote = BigNumber.min(maxValuePerVote, expectedValuePerVote)

  const rewardInUSD = valuePerVote.times(newUserVotes)

  if (votingPool.gauge.address === '0x0312aa8d0ba4a1969fddb382235870bf55f7f242') {
    console.log({
      maxValuePerVote: maxValuePerVote.toString(),
      expectedValuePerVote: expectedValuePerVote.toString(),
    })
  }

  return rewardInUSD
}

export function calculateMyValuePerVote(
  newWeight: string | number,
  votingPool: VotingPoolWithData,
  slope: bigint,
  lockEnd: number | undefined,
  totalVotes: bigint,
  blacklistedVotes: BigNumber = bn(0),
  priceFor: (address: string, chain: GqlChain) => number
) {
  const votingPower = calculateVotingPower(slope, lockEnd)
  const newUserVotes = votingPower.times(bpsToPercentage(newWeight))
  const myRewards = calculateMyVoteRewardsValue(
    newWeight,
    votingPool,
    slope,
    lockEnd,
    totalVotes,
    blacklistedVotes,
    priceFor
  )

  return bn(myRewards).div(newUserVotes)
}

export function calculateVotingPower(slope: bigint, lockEnd: number | undefined) {
  if (!lockEnd) return bn(0)

  const nextVoteTimestamp = millisecondsToSeconds(startOfDayUtc(nextThursday(new Date())).getTime())
  const lockEndInSeconds = millisecondsToSeconds(lockEnd)

  return bn(slope)
    .shiftedBy(-18)
    .times(lockEndInSeconds - nextVoteTimestamp)
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
    title:
      'Your previously confirmed votes. Your confirmed votes are timelocked for 10 days and cannot be changed during this period.',
  },
  editVotes: {
    label: 'Edit votes',
  },
}
