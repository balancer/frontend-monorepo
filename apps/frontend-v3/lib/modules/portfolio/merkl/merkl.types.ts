/* Types manually extracted from this api call example:
 https://api.merkl.xyz/v3/rewards?user=0x1B72Bac3772050FDCaF468CcE7e20deb3cB02d89
 */

export type MerklRewardsSchema = {
  [key: ChainId]: Campaign
}

type ChainId = number

type Campaign = {
  campaignData: {
    [key: string]: CampaignData
  }
}

type CampaignData = {
  [key: string]: CampaignDataEntry
}

type CampaignDataEntry = {
  accumulated: string
  auxiliaryData1: string
  auxiliaryData2: string
  decimals: number
  mainParameter: string
  type: number
  symbol: string
  token: string
  unclaimed: string
}
