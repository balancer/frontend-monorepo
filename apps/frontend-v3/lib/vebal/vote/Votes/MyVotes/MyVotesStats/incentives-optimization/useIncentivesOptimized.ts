import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { Address } from 'viem'
import { isVotingTimeLocked } from '../../myVotes.helpers'
import { bn, MAX_BIGNUMBER, sum } from '@repo/lib/shared/utils/numbers'
import { Element, heap, push, pop, Heap } from './heap'
import { useQuery } from '@tanstack/react-query'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import BigNumber from 'bignumber.js'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type OptimizedVote = {
  gaugeAddress: Address
  votePrct: number
  incentivesAmount: number
}

export type OptimizedVotes = {
  votes: OptimizedVote[]
  totalIncentives: number
  isLoading: boolean
}

type PoolInfo = {
  gaugeAddress: Address
  votes: BigNumber
  incentives: {
    tokenPrice: number
    tokenAmount: number
    maxTokenPerVote: number
  }[]
  userVotes: BigNumber
  userPrct: BigNumber
}

// The smallest step that could be voted for is 0.01%, but in the past this has caused
// problems with the transactions. For now, we will set the step to 1%
const PERCENT_STEP = bn(0.01)

export function useIncentivesOptimized(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber | undefined>,
  inputsLoading: boolean
): OptimizedVotes {
  const { isLoadingTokenPrices } = useTokens()

  const { data, isPending } = useQuery({
    queryKey: ['optimized-incentives'],
    queryFn: () =>
      calculateIncentivesOptimized(
        votingPools,
        myVotes,
        userVotingPower,
        totalVotes,
        blacklistedVotes
      ),
    enabled: !inputsLoading && !isLoadingTokenPrices,
  })

  const votes = data || []
  const [timelockedVotes] = filterTimelockedVotes(myVotes)
  const totalIncentives = sumTotalIncentives(
    votes,
    timelockedVotes,
    userVotingPower,
    totalVotes,
    blacklistedVotes
  )

  return { votes, totalIncentives, isLoading: isPending }
}

export function calculateIncentivesOptimized(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber | undefined>
): OptimizedVote[] {
  const [timelockedVotes, timelockedPrct] = filterTimelockedVotes(myVotes)

  let prctToDistribute = bn(1).minus(timelockedPrct)

  const availableVotingPools = votingPools
    .filter(pool => !findByGaugeAddress(timelockedVotes, pool.gauge.address as Address))
    .filter(pool => !pool.gauge.isKilled)

  const prioritizedPools = buildPoolsWithPriorities(
    availableVotingPools,
    myVotes,
    userVotingPower,
    totalVotes,
    blacklistedVotes
  )

  const stepVoteAmount = userVotingPower.times(PERCENT_STEP)

  while (prctToDistribute.gt(0)) {
    const bestPool = pop(prioritizedPools)
    if (bestPool) {
      bestPool.votes = bestPool.votes.plus(stepVoteAmount)
      bestPool.userVotes = bestPool.userVotes.plus(stepVoteAmount)
      bestPool.userPrct = bestPool.userPrct.plus(PERCENT_STEP)
    }
    push(prioritizedPools, bestPool)
    prctToDistribute = prctToDistribute.minus(PERCENT_STEP)
  }

  const votesToReset = myVotes.filter(
    pool => !findByGaugeAddress(timelockedVotes, pool.gauge.address as Address)
  )

  const votes = mergeOptimizedVotes(resetVotes(votesToReset), prioritizedPools)

  return votes
}

function findByGaugeAddress(voteOrPools: VotingPoolWithData[], gaugeAddress: Address) {
  return voteOrPools.find(item => isSameAddress(item.gauge.address, gaugeAddress))
}

function extractVoteAmountAndIncentives(
  votingPools: VotingPoolWithData[],
  totalVotes: BigNumber
): PoolInfo[] {
  return votingPools
    .map(pool => {
      const voteAmount = totalVotes.shiftedBy(-18).times(bn(pool.gaugeVotes?.votesNextPeriod || 0n))
      const incentives = !pool.votingIncentive?.incentives
        ? []
        : pool.votingIncentive.incentives.map(incentive => {
            return {
              tokenPrice: incentive.token.price,
              tokenAmount: incentive.token.amount,
              maxTokenPerVote: incentive.maxTokensPerVote,
            }
          })

      return {
        gaugeAddress: pool.gauge.address as Address,
        votes: voteAmount,
        incentives,
        userVotes: bn(0),
        userPrct: bn(0),
      }
    })
    .filter(poolInfo => poolInfo.incentives.length !== 0)
}

function buildPoolsWithPriorities(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber | undefined>
) {
  const votesAndIncentives = extractVoteAmountAndIncentives(votingPools, totalVotes)
  removeCurrentVotesFromGauges(votesAndIncentives, myVotes, userVotingPower)
  removeBlacklistedVotes(votesAndIncentives, blacklistedVotes)

  const priorityHeap = heap<Element<PoolInfo>>(votesAndIncentives.length, incentivePerVote)
  votesAndIncentives.forEach(pool => push(priorityHeap, pool))

  return priorityHeap
}

function incentivePerVote(pool: Element<PoolInfo>) {
  if (!pool || pool.incentives.length === 0) return 0

  const valuePerVote = pool.incentives.reduce((acc, incentive) => {
    const incentiveTokenPrice = bn(incentive.tokenPrice)
    const totalIncentives = incentiveTokenPrice.times(incentive.tokenAmount)
    const maxValuePerVote = incentiveTokenPrice.times(incentive.maxTokenPerVote)
    const expectedValuePerVote = bn(totalIncentives).div(pool.votes.shiftedBy(-18))
    const valuePerVote = BigNumber.min(
      maxValuePerVote.isZero() ? MAX_BIGNUMBER : maxValuePerVote,
      expectedValuePerVote
    )

    return acc.plus(valuePerVote)
  }, bn(0))

  return valuePerVote.toNumber()
}

function removeCurrentVotesFromGauges(
  votingPools: PoolInfo[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber
) {
  return votingPools.map(pool => {
    const oldVote = findOldVote(myVotes, pool.gaugeAddress)
    const oldVotePrct = bn(oldVote?.gaugeVotes?.userVotes || 0).div(10000)
    const oldVotesAmount = userVotingPower.times(oldVotePrct)
    pool.votes = pool.votes.minus(oldVotesAmount)

    return pool
  })
}

function removeBlacklistedVotes(
  votingPools: PoolInfo[],
  blacklistedVotes: Record<Address, BigNumber | undefined>
) {
  return votingPools.map(pool => {
    const blacklistedVotesAmount = blacklistedVotes[pool.gaugeAddress] || 0
    pool.votes = pool.votes.minus(blacklistedVotesAmount)
  })
}

function filterTimelockedVotes(myVotes: VotingPoolWithData[]): [VotingPoolWithData[], BigNumber] {
  const timelockedVotes = myVotes.filter(vote =>
    isVotingTimeLocked(vote.gaugeVotes?.lastUserVoteTime || 0)
  )

  const timelockedPrct = timelockedVotes.reduce((acc, vote) => {
    const userVotes = bn(vote.gaugeVotes?.userVotes || 0).div(10000)
    return acc.plus(userVotes)
  }, bn(0))

  return [timelockedVotes, timelockedPrct]
}

export function areAllVotesTimelocked(myVotes: VotingPoolWithData[]) {
  const [, prct] = filterTimelockedVotes(myVotes)
  return prct.isEqualTo(1)
}

function resetVotes(myVotes: VotingPoolWithData[]) {
  return myVotes.reduce((acc, vote) => {
    acc.push({
      gaugeAddress: vote.gauge.address as Address,
      votePrct: 0,
      incentivesAmount: 0,
    })

    return acc
  }, [] as OptimizedVote[])
}

function mergeOptimizedVotes(votes: OptimizedVote[], poolVotes: Heap<Element<PoolInfo>>) {
  return poolVotes.elements.reduce((acc, pool) => {
    if (pool && bn(pool.userVotes).gt(0)) {
      const incentives = pool.userVotes.shiftedBy(-18).times(incentivePerVote(pool))

      const vote = findVote(votes, pool.gaugeAddress)
      if (!vote) {
        acc.push({
          gaugeAddress: pool.gaugeAddress,
          votePrct: pool.userPrct.toNumber(),
          incentivesAmount: incentives.toNumber(),
        })
      } else {
        vote.votePrct = pool.userPrct.toNumber()
        vote.incentivesAmount = incentives.toNumber()
      }
    }

    return acc
  }, votes)
}

function findVote(votes: OptimizedVote[], gaugeAddress: Address) {
  return votes.find(vote => vote.gaugeAddress === gaugeAddress)
}

function findOldVote(votes: VotingPoolWithData[], gaugeAddress: Address) {
  return votes.find(vote => vote.gauge.address === gaugeAddress)
}

function sumTotalIncentives(
  optimizedVotes: OptimizedVote[],
  timelockedVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber | undefined>
) {
  const optimizedVotesAmount = sum(optimizedVotes, vote => bn(vote.incentivesAmount))

  const timelockedVotesAmount = timelockedVotes.reduce((acc, vote) => {
    const poolBlacklistedVotes = blacklistedVotes[vote.gauge.address as `0x${string}`] || bn(0)
    const poolVotes = totalVotes
      .times(bn(vote.gaugeVotes?.votesNextPeriod || 0).shiftedBy(-18))
      .minus(poolBlacklistedVotes)
      .shiftedBy(-18)
    const userPoolVotes = userVotingPower
      .times(bn(vote.gaugeVotes?.userVotes || 0).div(10000))
      .shiftedBy(-18)

    if (!vote.votingIncentive?.incentives) return acc

    const valuePerVote = vote?.votingIncentive?.incentives.reduce((acc, incentive) => {
      const incentiveTokenPrice = bn(incentive.token.price)
      const totalIncentives = incentiveTokenPrice.times(incentive.token.amount)
      const maxValuePerVote = incentiveTokenPrice.times(incentive.maxTokensPerVote)
      const expectedValuePerVote = bn(totalIncentives).div(poolVotes)
      const valuePerVote = BigNumber.min(
        maxValuePerVote.isZero() ? MAX_BIGNUMBER : maxValuePerVote,
        expectedValuePerVote
      )

      return acc.plus(valuePerVote)
    }, bn(0))

    return acc.plus(userPoolVotes.times(valuePerVote))
  }, bn(0))

  return optimizedVotesAmount.plus(timelockedVotesAmount).toNumber()
}
