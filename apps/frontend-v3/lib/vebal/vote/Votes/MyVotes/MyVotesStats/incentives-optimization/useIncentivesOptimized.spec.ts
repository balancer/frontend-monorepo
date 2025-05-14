import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { OptimizedVotes, useIncentivesOptimized } from './useIncentivesOptimized'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { millisecondsToSeconds, subDays } from 'date-fns'
import { Address } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'

const one_month_ago = subDays(new Date(), 30)

function renderHook(
  votingPools: VotingPoolWithData[],
  myVotes: VotingPoolWithData[],
  userVotingPower: BigNumber,
  totalVotes: BigNumber,
  blacklistedVotes: Record<Address, BigNumber>,
  inputsLoading: boolean
) {
  const { result } = testHook(() =>
    useIncentivesOptimized(
      votingPools,
      myVotes,
      userVotingPower,
      totalVotes,
      blacklistedVotes,
      inputsLoading
    )
  )

  return result
}

describe('Incentives optimization', () => {
  it('should return loading when input votes and pools still loading', () => {
    const inputLoading = true

    const result = renderHook([], [], total(1), total(100), {}, inputLoading)

    expect(result.current.isLoading).toBe(true)
  })

  it('should filter out time locked votes', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    pool2.votingIncentive = incentivesWithAmount(10)
    const timelockedVote = timelock(vote(pool1, 0.05, new Date()))

    const result = renderHook([pool1, pool2], [timelockedVote], total(1), total(100), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const vote2 = getVote(result.current, pool2.gauge.address as Address)

    expect(result.current.votes.length).toBe(1)
    expect(vote2?.votePrct).toBe(0.95)
  })

  it('should zero out killed pools', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    const killedPool = kill(pool1)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    pool2.votingIncentive = incentivesWithAmount(10)
    const vote1 = vote(pool1, 0.05, one_month_ago)

    const result = renderHook([killedPool, pool2], [vote1], total(1), total(100), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const killedPoolVote = getVote(result.current, killedPool.gauge.address as Address)
    const vote2 = getVote(result.current, pool2.gauge.address as Address)

    expect(result.current.votes.length).toBe(2)
    expect(killedPoolVote?.votePrct).toBe(0.0)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should distribute votes to the pool with biggest reward / vote', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(10)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)

    const result = renderHook([pool1, pool2], [], total(5), total(100), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const vote2 = getVote(result.current, pool2.gauge.address as Address)

    expect(result.current.votes.length).toBe(1)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should remove old votes from gauges total', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(100)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)
    const vote1 = vote(pool1, 1.0, one_month_ago)

    const result = renderHook([pool1, pool2], [vote1], total(1), total(100), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const vote1Updated = getVote(result.current, pool1.gauge.address as Address)

    expect(result.current.votes.length).toBe(1)
    expect(vote1Updated?.votePrct).toBe(1.0)
  })

  it('should remove blacklisted votes from gauges total', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.5)
    pool1.votingIncentive = incentivesWithAmount(100)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    setPoolVotes(pool2, 0.5)
    pool2.votingIncentive = incentivesWithAmount(100)
    const blacklistedVotes = { '0xd75026f8723b94d9a360a282080492d905c6a559': total(1) }

    const result = renderHook([pool1, pool2], [], total(1), total(100), blacklistedVotes, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const vote2 = getVote(result.current, pool2.gauge.address as Address)

    expect(result.current.votes.length).toBe(1)
    expect(vote2?.votePrct).toBe(1.0)
  })

  it('should calculate the amount of incentives', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    setPoolVotes(pool1, 0.0)
    pool1.votingIncentive = incentivesWithAmount(100)

    const result = renderHook([pool1], [], total(1), total(0), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    const vote1 = getVote(result.current, pool1.gauge.address as Address)

    expect(vote1?.incentivesAmount).toBe(100)
  })

  it('should return the total number of incentives (timelocked + optimized)', async () => {
    const pool1 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a558', 'pool1')
    pool1.votingIncentive = incentivesWithAmount(100)
    setPoolVotes(pool1, 0.0)
    const pool2 = votingPool('0xd75026f8723b94d9a360a282080492d905c6a559', 'pool2')
    pool2.votingIncentive = incentivesWithAmount(100)
    setPoolVotes(pool2, 0.05)
    const timelockedVote = timelock(vote(pool2, 0.05, new Date()))

    const result = renderHook([pool1, pool2], [timelockedVote], total(100), total(100), {}, false)
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.totalIncentives).toBe(200)
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
    poolTokens: [],
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
    votingPool.gaugeVotes.userVotes = (votesPrct * 10000).toString()
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

function total(value: number) {
  return bn(value).shiftedBy(18)
}
