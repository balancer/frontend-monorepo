export interface MyVotesTotalInfo {
  totalValue?: number
  valuePerVote?: number
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

export const orderByHash: Record<SortingBy, { label: string; title?: string }> = {
  bribes: {
    label: 'Bribes',
    title:
      'Voting incentives (referred to as ‘Bribes’ in DeFi) are provided by unaffiliated 3rd parties through the Hidden Hand platform to incentivize liquidity to certain pools.',
  },
  bribesPerVebal: {
    label: 'Bribes/veBAL',
    title:
      'This shows the ratio of 3rd party voting incentives (known as Bribes) to veBAL. The higher this ratio, the more profitable it is to currently vote on this pool. Note this ratio could change up till the voting deadline.',
  },
  currentVotes: {
    label: 'Current votes',
  },
  editVotes: {
    label: 'Edit votes',
  },
}
