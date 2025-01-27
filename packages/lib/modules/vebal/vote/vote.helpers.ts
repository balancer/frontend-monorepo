import {
  VotingPoolWithData,
  VotesState,
  SortVotesBy,
} from '@repo/lib/modules/vebal/vote/vote.types'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

export function getVotesState(relativeWeightCap: number, votesNextPeriod: number) {
  if (relativeWeightCap === 0 || votesNextPeriod === 0) return VotesState.Normal
  if (votesNextPeriod > relativeWeightCap) {
    return VotesState.Exceeded
  }
  if (relativeWeightCap - votesNextPeriod <= 0.01) {
    return VotesState.Close
  }
  return VotesState.Normal
}

export function voteToPool(vote: VotingPoolWithData) {
  return {
    displayTokens: vote.tokens.map(token => ({ ...token, name: token.symbol })), // fix: (votes) no name
    type: vote.type,
    chain: vote.chain,
    poolTokens: [],
    address: vote.address,
    protocolVersion: 3, // fix: (votes) no data
    hasAnyAllowedBuffer: false, // fix: (votes) no data
    hasErc4626: false, // fix: (votes) no data
  }
}

export function isGaugeExpired(expiredGauges: string[] | undefined, gaugeAddress: string): boolean {
  if (!expiredGauges) return false
  return expiredGauges.some(item => isSameAddress(gaugeAddress, item))
}

export function isPoolExpired(pool: VotingPoolWithData) {
  return pool.gauge.isKilled
}

export const orderByHash: Record<SortVotesBy, { label: string; title?: string }> = {
  type: { label: 'Type' },
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
  votes: { label: 'veBAL votes' },
}
