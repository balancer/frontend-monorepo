export interface PoolVoteIncentives {
  totalValue: number
  maxValuePerVote: number
  valuePerVote: number
  incentives: Incentive[]
  poolId: string
}

export interface Incentive {
  symbol: string
  token: string
  amount: number
  chainId: number
  value: number
  decimals: number
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

export interface StakeDaoVoteMarketResponse {
  lastBlock: number
  campaignCount: number
  campaigns: VoteMarketCampaign[]
}

interface Coin {
  name: string
  symbol: string
  address: string
  decimals: number
}

interface LiquidityPool {
  name: string
  symbol: string
  address: string
  decimals: number
}

interface Gauge {
  gauge: string
  childGauge: string
  manager: string
  name: string
  weight: string
  relativeWeight: string
  futureRelativeWeight: string
  isKilled: boolean
  chainId: number
  pool: string
  lp: LiquidityPool
  coins: Coin[]
  inController: boolean
}

export interface Balancer {
  totalGaugesWeight: string
  lastUpdate: number
  gauges: Gauge[]
}
