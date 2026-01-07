import {
  PoolVoteIncentives,
  StakeDaoVoteMarketResponse,
} from '@repo/lib/shared/services/votemarket/votemarket.types'
import { mins } from '@repo/lib/shared/utils/time'
import { useQuery } from '@tanstack/react-query'

const STAKE_DAO_BASE_URL = 'https://api-v3.stakedao.org'

export function useVoteMarketIncentives() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['votemarket-incentives'],
    queryFn: async () => getAllVoteMarketsIncentives(),
    refetchInterval: mins(1).toSecs(),
  })

  return {
    incentives: data,
    incentivesError: error,
    incentivesAreLoading: isLoading,
  }
}

async function getAllVoteMarketsIncentives() {
  const stakeDaoIncentives = await getStakeDaoIncentives()

  return stakeDaoIncentives
}

async function getStakeDaoIncentives(): Promise<PoolVoteIncentives[]> {
  const stakeDaoResponse = await fetchStakeDaoVoteMarket()

  return stakeDaoResponse.campaigns
    .filter(campaign => campaign.status.voteOpen)
    .map(campaign => ({
      gauge: campaign.gauge.toLowerCase(),
      status: campaign.status,
      totalValue: Number(campaign.currentPeriod.rewardPerPeriod),
      maxValuePerVote: Number(campaign.maxRewardPerVote),
      valuePerVote: Number(campaign.currentPeriod.rewardPerVote),
      incentives: [
        {
          symbol: campaign.rewardToken.symbol,
          token: campaign.rewardToken.address,
          amount: Number(campaign.currentPeriod.rewardPerPeriod),
          chainId: campaign.rewardChainId,
          value: campaign.rewardToken.price,
          decimals: campaign.rewardToken.decimals,
          maxTokensPerVote: Number(campaign.maxRewardPerVote),
          briber: campaign.manager,
          isBlacklist: campaign.isBlacklist,
        },
      ],
    }))
}

async function fetchStakeDaoVoteMarket(): Promise<StakeDaoVoteMarketResponse> {
  const res = await fetch(`${STAKE_DAO_BASE_URL}/votemarket/balancer`)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao votemarket: ${res.status}`)

  return res.json()
}
