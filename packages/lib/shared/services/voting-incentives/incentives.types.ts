export interface PoolVotingIncentivesPerWeek {
  gauge: string
  totalValue: number
  valuePerVote: number
  incentives: Incentive[]
}

export interface Incentive {
  token: VoteMarketToken & { amount: number }
  maxTokensPerVote: number
  briber: string
}

export interface VoteMarketToken {
  name: string
  symbol: string
  address: string
  decimals: number
  chainId: number
  price: number
}

export interface VoteMarketPeriod {
  rewardPerPeriod: string
  rewardPerVote: string
  leftover: string
  updated: boolean
  timestampStart: number
  timestampEnd: number
}

export interface VoteMarketCampaignStatus {
  voteOpen: boolean
  voteClosed: boolean
  claimOpen: boolean
  claimClosed: boolean
  expired: boolean
}

export interface VoteMarketCampaign {
  key: string
  id: number
  platform: string
  chainId: number
  gaugeChainId: number
  gauge: string
  manager: string
  rewardToken: VoteMarketToken
  numberOfPeriods: number
  maxRewardPerVote: string
  totalRewardAmount: string
  totalDistributed: string
  startTimestamp: number
  endTimestamp: number
  hook: string
  isClosed: boolean
  isWhitelist: boolean
  addresses: string[]
  periods: VoteMarketPeriod[]
  periodLeft: number
  rewardAddress: string
  rewardChainId: number
  totalClaimed: string
  receiptRewardToken: VoteMarketToken
  rewardTokenPrice: number
  isBlacklist: boolean
  restrictedVotes: string
  previousPeriod: VoteMarketPeriod | null
  currentPeriod: VoteMarketPeriod
  status: VoteMarketCampaignStatus
  liquidityScore: number
}

export interface VoteMarketResponse {
  lastBlock: number
  campaignCount: number
  campaigns: VoteMarketCampaign[]
}
