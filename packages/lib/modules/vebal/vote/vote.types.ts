import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { VotesData } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
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
