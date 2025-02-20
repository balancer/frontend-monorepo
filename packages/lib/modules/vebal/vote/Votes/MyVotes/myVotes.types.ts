export interface MyVotesTotalInfo {
  totalValue?: number
  averageBribesValue?: number
  averageBribesValueGain?: number
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
