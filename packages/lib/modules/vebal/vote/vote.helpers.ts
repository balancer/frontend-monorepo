import { VotesState, SortVotesBy } from '@repo/lib/modules/vebal/vote/vote.types'

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
