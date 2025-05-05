/* Types manually extracted from this api call example:
 https://api.merkl.xyz/v4/users/0x1B72Bac3772050FDCaF468CcE7e20deb3cB02d89/rewards?chainId=8453
 */

export type MerklRewardsResponse = Array<{
  chain: {
    id: number
    name: string
    icon: string
    Explorer: Array<{
      id: string
      type: string
      url: string
      chainId: number
    }>
  }
  rewards: Array<MerklReward>
}>

export type MerklReward = {
  root: string
  recipient: string
  amount: string
  claimed: string
  pending: string
  proofs: string[]
  token: {
    address: string
    chainId: number
    symbol: string
    decimals: number
  }
  breakdowns: Array<MerklRewardBreakdown>
}

export type MerklRewardBreakdown = {
  reason: string
  amount: string
  claimed: string
  pending: string
  campaignId: string
}
