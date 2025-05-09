import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { OptimizedVotes, useIncentivesOptimized } from './useIncentivesOptimized'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { millisecondsToSeconds, subDays } from 'date-fns'
import { Address } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'

const one_month_ago = subDays(new Date(), 30)

describe('Incentives optimization', () => {
  it('should return loading when input votes and pools still loading', () => {
    const inputLoading = true

    const result = useIncentivesOptimized([], [], bn(1), bn(100), {}, inputLoading)

    expect(result.isLoading).toBe(true)
  })

  it('should filter out time locked votes', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    pool2.votingIncentive = incentivesWithAmount(10)
    const timelockedVote = timelock(vote(pool1, 0.05, new Date()))

    const result = useIncentivesOptimized(
      [pool1, pool2],
      [timelockedVote],
      bn(1),
      bn(100),
      {},
      false
    )
    const vote1 = getVote(result, pool1.gauge.address as Address)
    const vote2 = getVote(result, pool2.gauge.address as Address)

    expect(result.votes.length).toBe(2)
    expect(vote1?.votePrct).toBe(0.0)
    expect(vote2?.votePrct).toBe(0.95)
  })

  it('should zero out killed pools', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    const killedPool = kill(pool1)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    pool2.votingIncentive = incentivesWithAmount(10)
    const vote1 = vote(pool1, 0.05, one_month_ago)

    const result = useIncentivesOptimized([killedPool, pool2], [vote1], bn(1), bn(100), {}, false)
    const killedPoolVote = getVote(result, killedPool.gauge.address as Address)
    const vote2 = getVote(result, pool2.gauge.address as Address)

    expect(result.votes.length).toBe(2)
    expect(killedPoolVote?.votePrct).toBe(0.0)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should distribute votes to the pool with biggest reward / vote', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(10)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)

    const result = useIncentivesOptimized([pool1, pool2], [], bn(1), bn(100), {}, false)
    const vote2 = getVote(result, pool2.gauge.address as Address)

    expect(result.votes.length).toBe(1)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should remove old votes from gauges total', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(100)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)
    const vote1 = vote(pool1, 1.0, one_month_ago)

    const result = useIncentivesOptimized([pool1, pool2], [vote1], bn(1), bn(100), {}, false)
    const vote1Updated = getVote(result, pool1.gauge.address as Address)

    expect(result.votes.length).toBe(1)
    expect(vote1Updated?.votePrct).toBe(1.0)
  })

  it('should remove blacklisted votes from gauges total', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(100)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)
    const blacklistedVotes = { '0xd75026f8723b94d9a360a282080492d905c6a559': bn(1) }

    const result = useIncentivesOptimized(
      [pool1, pool2],
      [],
      bn(1),
      bn(100),
      blacklistedVotes,
      false
    )
    const vote2 = getVote(result, pool2.gauge.address as Address)

    expect(result.votes.length).toBe(1)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should calculate the amount of incentives', () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.0)
    pool1.votingIncentive = incentivesWithAmount(100)

    const result = useIncentivesOptimized([pool1], [], bn(1), bn(0), {}, false)
    const vote1 = getVote(result, pool1.gauge.address as Address)

    expect(vote1?.incentivesAmount).toBe(100)
  })
})

function getVote(result: OptimizedVotes, gaugeAddress: Address) {
  return result.votes.find(vote => vote.gaugeAddress === gaugeAddress)
}

function votingPool(gaugeAddress: Address, symbol: string): VotingPoolWithData {
  return {
    __typename: 'GqlVotingPool',
    id: '0xc771c1a5905420daec317b154eb13e4198ba97d0000000000000000000000023',
    symbol,
    address: '0xc771c1a5905420daec317b154eb13e4198ba97d0',
    chain: GqlChain.Base,
    type: GqlPoolType.ComposableStable,
    protocolVersion: 2,
    tokens: [{ __typename: 'GqlVotingGaugeToken', address: '', logoURI: '', symbol: '' }],
    gauge: {
      __typename: 'GqlVotingGauge',
      address: gaugeAddress,
      isKilled: false,
      relativeWeight: '0.009591975004609172',
    },
    gaugeVotes: {
      votes: '9591975004609171', // 0,96%
      votesNextPeriod: '9591975004609171', // 0,96%
      userVotes: '', // '500' = 5%
      lastUserVoteTime: 0,
    },
    votingIncentive: incentivesWithAmount(0),
  }
}

function vote(votingPool: VotingPoolWithData, votesPrct: number, voteTimestamp: Date) {
  if (votingPool.gaugeVotes) {
    votingPool.gaugeVotes.userVotes = (votesPrct * 1000).toString()
    votingPool.gaugeVotes.lastUserVoteTime = millisecondsToSeconds(voteTimestamp.getTime())
  }

  return votingPool
}

function setPoolVotes(votingPool: VotingPoolWithData, votesPrct: number) {
  if (votingPool.gaugeVotes) {
    votingPool.gaugeVotes.votesNextPeriod = bn(votesPrct).shiftedBy(18).toString()
  }

  return votingPool
}

function incentivesWithAmount(amount: number): HiddenHandData {
  return {
    proposal: '',
    proposalHash: '',
    title: '',
    proposalDeadline: 0,
    totalValue: amount,
    maxTotalValue: amount,
    voteCount: -1,
    maxValuePerVote: -1,
    valuePerVote: -1,
    bribes: [],
    efficiency: 0,
    poolId: '',
  }
}

function kill(votingPool: VotingPoolWithData) {
  votingPool.gauge.isKilled = true
  return votingPool
}

function timelock(vote: VotingPoolWithData) {
  const nine_days_ago = subDays(new Date(), 9)
  if (vote.gaugeVotes) {
    vote.gaugeVotes.lastUserVoteTime = millisecondsToSeconds(nine_days_ago.getTime())
  }

  return vote
}
