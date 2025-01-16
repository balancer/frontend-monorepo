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

export enum SortVotesBy {
  type = 'type',
  bribes = 'bribes',
  bribesPerVebal = 'bribesPerVebal',
  votes = 'votes',
}
