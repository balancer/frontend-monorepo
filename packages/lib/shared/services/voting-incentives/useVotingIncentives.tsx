import {
  PoolVotingIncentivesPerWeek,
  VoteMarketResponse,
} from '@repo/lib/shared/services/voting-incentives/incentives.types'
import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'

const STAKE_DAO_VOTE_MARKET_URL = 'https://api-v3.stakedao.org/votemarket/balancer'

export function useVotingIncentives() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['voting-incentives'],
    queryFn: async () => getAllVotingIncentives(),
    ...onlyExplicitRefetch,
  })

  return { incentives: data, incentivesError: error, incentivesAreLoading: isLoading }
}

async function getAllVotingIncentives(): Promise<PoolVotingIncentivesPerWeek[]> {
  // add new voting incentive sources here
  const stakeDaoIncentives = await getStakeDaoIncentives()

  return [...stakeDaoIncentives]
}

async function getStakeDaoIncentives(): Promise<PoolVotingIncentivesPerWeek[]> {
  const stakeDaoVoteMarket = await fetchStakeDaoVoteMarket()

  const voteOpenCampaigns = stakeDaoVoteMarket.campaigns.filter(
    campaign => campaign.status.voteOpen
  )

  // Group campaigns by gauge address and sum values
  const campaignsByGauge = voteOpenCampaigns.reduce(
    (acc, campaign) => {
      const gaugeAddress = campaign.gauge.toLowerCase()

      const tokenAmountPerWeek = Number(campaign.currentPeriod.rewardPerPeriod)
      const usdPerToken = Number(campaign.rewardToken.price)
      const usdPerWeek = tokenAmountPerWeek * usdPerToken

      const tokenAmountPerVote = Number(campaign.currentPeriod.rewardPerVote)
      const usdPerVote = tokenAmountPerVote * usdPerToken

      const incentive = {
        symbol: campaign.rewardToken.symbol,
        token: campaign.rewardToken.address,
        amount: usdPerWeek,
        chainId: campaign.rewardChainId,
        value: usdPerToken,
        decimals: campaign.rewardToken.decimals,
        maxTokensPerVote: Number(campaign.maxRewardPerVote), // this is suspicious
        briber: campaign.manager,
      }

      if (!acc[gaugeAddress]) {
        acc[gaugeAddress] = {
          gauge: gaugeAddress,
          totalValue: usdPerWeek,
          valuePerVote: usdPerVote,
          incentives: [incentive],
        }
      } else {
        // Merge with existing gauge entry
        acc[gaugeAddress].totalValue += usdPerWeek
        acc[gaugeAddress].valuePerVote += usdPerVote
        acc[gaugeAddress].incentives.push(incentive)
      }

      return acc
    },
    {} as Record<string, PoolVotingIncentivesPerWeek>
  )

  return Object.values(campaignsByGauge)
}

async function fetchStakeDaoVoteMarket(): Promise<VoteMarketResponse> {
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao Votemarket data: ${res.status}`)

  return res.json()
}
