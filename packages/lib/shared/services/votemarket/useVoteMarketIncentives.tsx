import {
  PoolVoteIncentivesPerWeek,
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

async function getStakeDaoIncentives(): Promise<PoolVoteIncentivesPerWeek[]> {
  const stakeDaoVoteMarket = await fetchStakeDaoVoteMarket()

  return stakeDaoVoteMarket.campaigns
    .filter(campaign => campaign.status.voteOpen)
    .map(campaign => {
      const rewardPerWeek = Number(campaign.currentPeriod.rewardPerPeriod)
      const rewardPerVote = Number(campaign.currentPeriod.rewardPerVote)
      const maxRewardPerVote = Number(campaign.maxRewardPerVote)

      return {
        gauge: campaign.gauge.toLowerCase(),
        status: campaign.status,
        totalValue: rewardPerWeek,
        valuePerVote: rewardPerVote,
        incentives: [
          {
            symbol: campaign.rewardToken.symbol,
            token: campaign.rewardToken.address,
            amount: rewardPerWeek,
            chainId: campaign.rewardChainId,
            value: campaign.rewardToken.price,
            decimals: campaign.rewardToken.decimals,
            maxTokensPerVote: maxRewardPerVote,
            briber: campaign.manager,
            isBlacklist: campaign.isBlacklist,
          },
        ],
      }
    })
}

async function fetchStakeDaoVoteMarket(): Promise<StakeDaoVoteMarketResponse> {
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao votemarket: ${res.status}`)

  return res.json()
}
