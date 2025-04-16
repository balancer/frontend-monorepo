export interface MyVotesTotalInfo {
  totalRewardValue: BigNumber
  prevTotalRewardValue: BigNumber
  totalRewardValueGain: BigNumber
  averageRewardPerVote: BigNumber
  averageRewardPerVoteGain: BigNumber
  currentVotes: BigNumber
  editVotes: BigNumber
  unallocatedVotes: BigNumber
}

export enum SortingBy {
  bribes = 'bribes',
  bribesPerVebal = 'bribesPerVebal',
  currentVotes = 'currentVotes',
  editVotes = 'editVotes',
}
