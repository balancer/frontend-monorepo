import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { VotesData } from './useGaugeVotes'
import { HiddenHandIncentives } from '@repo/lib/shared/services/hidden-hand/useHiddenHandVotingIncentives'

export type VoteList = GetVeBalVotingListQuery['veBalGetVotingList']

export type VoteListItem = VoteList[0]

export type VotingPoolWithData = VoteListItem & {
  gaugeVotes: VotesData | undefined
  votingIncentive: HiddenHandIncentives | undefined
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

export enum LockActionType {
  CreateLock = 'createLock',
  IncreaseLock = 'increaseAmount',
  ExtendLock = 'extendLock',
  Unlock = 'unlock',
}

export interface UserVotesData {
  end: bigint
  power: bigint
  slope: bigint
}
