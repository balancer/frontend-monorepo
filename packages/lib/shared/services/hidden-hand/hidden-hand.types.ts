export interface HiddenHandIncentives {
  error: boolean
  data: HiddenHandData[]
}

export interface HiddenHandData {
  proposal: string
  proposalHash: string
  title: string
  proposalDeadline: number
  totalValue: number
  voteCount: number
  maxValuePerVote: number
  valuePerVote: number
  maxTotalValue: number
  bribes: Bribe[]
  efficiency: number
  poolId: string
}

export interface Bribe {
  symbol: string
  token: string
  amount: number
  chainId: number
  value: number
  decimals: number
  maxValue: number
  maxTokensPerVote: number
  briber: string
  periodIndex: number
  refunds: number
  periodCount: number
}

export interface HiddenHandRewards {
  error: boolean
  data: HiddenHandRewards[]
}

export interface HiddenHandRewards {
  symbol: string
  name: string
  token: string
  decimals: number
  chainId: number
  protocol: string
  claimable: string
  cumulativeAmount: string
  value: number
  activeTimer: number
  pausedTimer: number
  claimMetadata: ClaimMetadata
}

export interface ClaimMetadata {
  identifier: string
  account: string
  amount: string
  merkleProof: string[]
}
