import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { VotesData } from '@repo/lib/modules/vebal/vote/gauge/useGaugeVotes'
import { HiddenHandData } from '@repo/lib/modules/vebal/vote/hidden-hand/hidden-hand.type'

export type VoteList = GetVeBalVotingListQuery['veBalGetVotingList']

export type VoteListItem = VoteList[0]

export type VotingPoolWithData = VoteListItem & {
  gaugeVotes: VotesData | undefined
  votingIncentive: HiddenHandData | undefined
}
