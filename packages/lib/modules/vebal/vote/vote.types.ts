import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'

export type VoteList = GetVeBalVotingListQuery['veBalGetVotingList']

export type VoteListItem = VoteList[0]
