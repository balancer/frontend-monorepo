import {
  PoolVoteIncentives,
  StakeDaoVoteMarketResponse,
} from '@repo/lib/shared/services/votemarket/votemarket.types'
import { mins } from '@repo/lib/shared/utils/time'
import { useQuery } from '@tanstack/react-query'

const STAKE_DAO_VOTE_MARKET_URL = 'https://api-v3.stakedao.org/votemarket/balancer'

export function useVoteMarketIncentives() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['votemarket-incentives'],
    queryFn: async () => getStakeDaoIncentives(),
    refetchInterval: mins(1).toSecs(),
  })

  return {
    incentives: data,
    incentivesError: error,
    incentivesAreLoading: isLoading,
  }
}

async function getStakeDaoIncentives(): Promise<PoolVoteIncentives[]> {
  const stakeDaoVoteMarket = await fetchStakeDaoVoteMarket()

  return stakeDaoVoteMarket.campaigns
    .filter(campaign => campaign.status.voteOpen)
    .map(campaign => ({
      gauge: campaign.gauge.toLowerCase(),
      status: campaign.status,
      totalValue: Number(campaign.currentPeriod.rewardPerPeriod),
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
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao votemarket: ${res.status}`)

  return res.json()
}
