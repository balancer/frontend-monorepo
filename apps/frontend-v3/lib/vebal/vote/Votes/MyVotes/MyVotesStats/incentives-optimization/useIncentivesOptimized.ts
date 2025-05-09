import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { Address } from 'viem'
import { isVotingTimeLocked } from '../../myVotes.helpers'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Element, heap, push, pop, Heap } from './heap'
import { useQuery } from '@tanstack/react-query'

type OptimizedVote = {
  gaugeAddress: Address
  votePrct: number
  incentivesAmount: number
}

export type OptimizedVotes = {
  votes: OptimizedVote[]
  isLoading: boolean
}

type PoolInfo = {
  gaugeAddress: Address
  votes: BigNumber
  incentivesAmount: number
  userVotes: BigNumber
}

const PERCENT_STEP = bn(0.0001)

export function useIncentivesOptimized(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber>,
  inputsLoading: boolean
): OptimizedVotes {
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
    enabled: !inputsLoading,
  })

  const votes = data || []

  return { votes, isLoading: isPending }
}

export function calculateIncentivesOptimized(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber>
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
    }
    push(prioritizedPools, bestPool)
    prctToDistribute = prctToDistribute.minus(PERCENT_STEP)
  }

  const votes = mergeOptimizedVotes(resetVotes(myVotes), prioritizedPools, userVotingPower)

  return votes
}

function findByGaugeAddress(voteOrPools: VotingPoolWithData[], gaugeAddress: Address) {
  return voteOrPools.find(item => item.gauge.address === gaugeAddress)
}

function extractVoteAmountAndIncentives(
  votingPools: VotingPoolWithData[],
  totalVotes: BigNumber
): PoolInfo[] {
  return votingPools
    .map(pool => {
      const voteAmount = totalVotes.shiftedBy(-18).times(bn(pool.gaugeVotes?.votesNextPeriod || 0n))

      return {
        gaugeAddress: pool.gauge.address as Address,
        votes: voteAmount,
        incentivesAmount: pool.votingIncentive?.totalValue || 0,
        userVotes: bn(0),
      }
    })
    .filter(poolInfo => poolInfo.incentivesAmount !== 0)
}

function buildPoolsWithPriorities(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber>
) {
  const votesAndIncentives = extractVoteAmountAndIncentives(votingPools, totalVotes)
  removeCurrentVotesFromGauges(votesAndIncentives, myVotes, userVotingPower)
  removeBlacklistedVotes(votesAndIncentives, blacklistedVotes)

  const priorityHeap = heap<Element<PoolInfo>>(votesAndIncentives.length, incentivePerVote)
  votesAndIncentives.forEach(pool => push(priorityHeap, pool))

  return priorityHeap
}

function incentivePerVote(pool: Element<PoolInfo>) {
  if (!pool) return 0
  return bn(pool.incentivesAmount).div(pool.votes).toNumber()
}

function removeCurrentVotesFromGauges(
  votingPools: PoolInfo[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber
) {
  return votingPools.map(pool => {
    const oldVote = findOldVote(myVotes, pool.gaugeAddress)
    const oldVotePrct = bn(oldVote?.gaugeVotes?.userVotes || 0).div(1000)
    const oldVotesAmount = userVotingPower.times(oldVotePrct)
    pool.votes = pool.votes.minus(oldVotesAmount)

    return pool
  })
}

function removeBlacklistedVotes(
  votingPools: PoolInfo[],
  blacklistedVotes: Record<Address, BigNumber>
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
    const userVotes = bn(vote.gaugeVotes?.userVotes || 0).div(1000)
    return acc.plus(userVotes)
  }, bn(0))

  return [timelockedVotes, timelockedPrct]
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

function mergeOptimizedVotes(
  votes: OptimizedVote[],
  poolVotes: Heap<Element<PoolInfo>>,
  userVotingPower: BigNumber
) {
  return poolVotes.elements.reduce((acc, pool) => {
    if (pool && bn(pool.userVotes).gt(0)) {
      const vote = findVote(votes, pool.gaugeAddress)
      const incentives = userVotingPower.times(pool.userVotes).times(incentivePerVote(pool))
      if (!vote) {
        acc.push({
          gaugeAddress: pool.gaugeAddress,
          votePrct: pool.userVotes.toNumber(),
          incentivesAmount: incentives.toNumber(),
        })
      } else {
        vote.votePrct = pool.userVotes.toNumber()
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
