/*
This will be updated in voting list PR:
https://github.com/balancer/frontend-monorepo/pull/148

import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { VotesData } from '@repo/lib/modules/vebal/vote/gauge/useGaugeVotes'
import { HiddenHandData } from '@repo/lib/modules/vebal/vote/hidden-hand/hidden-hand.types'

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
  */
