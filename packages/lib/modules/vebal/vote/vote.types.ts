import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { VotesData } from './useGaugeVotes'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'

export type VoteList = GetVeBalVotingListQuery['veBalGetVotingList']

export type VoteListItem = VoteList[0]

export type VotingPoolWithData = VoteListItem & {
  gaugeVotes: VotesData | undefined
  votingIncentive: HiddenHandData | undefined
}

export enum VotesState {
  Normal = 'normal',
  Close = 'close',
  Exceeded = 'exceeded',
}

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
