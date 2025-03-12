export interface MyVotesTotalInfo {
  totalRewardValue?: number
  prevTotalRewardValue?: number
  totalRewardValueGain?: number
  averageRewardPerVote?: number
  averageRewardPerVoteGain?: number
  currentVotes?: number
  editVotes?: number
  unallocatedVotes?: number
}

export enum SortingBy {
  bribes = 'bribes',
  bribesPerVebal = 'bribesPerVebal',
  currentVotes = 'currentVotes',
  editVotes = 'editVotes',
}
