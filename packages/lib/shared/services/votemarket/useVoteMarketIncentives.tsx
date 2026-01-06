import {
  VoteMarketData,
  StakeDaoVoteMarketResponse,
} from '@repo/lib/shared/services/votemarket/votemarket.types'
import { mins } from '@repo/lib/shared/utils/time'
import { useQuery } from '@tanstack/react-query'

const STAKEDAO_VOTEMARKET_BALANCER_URL = 'https://api-v3.stakedao.org/votemarket/balancer'

export function useVoteMarketIncentives() {
  const queryKey = ['votemarket-incentives']

  const queryFn = async () => getVoteMarketIncentives()

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn,
    refetchInterval: mins(1).toSecs(),
  })

  return {
    incentives: data,
    incentivesError: error,
    incentivesAreLoading: isLoading,
  }
}

async function getVoteMarketIncentives(): Promise<VoteMarketData[]> {
  const stakeDaoResponse = await fetchStakeDaoVoteMarketBalancer()

  const stakeDaoVoteMarketIncentives = stakeDaoResponse.campaigns.map(campaign => {
    return {
      // TODO: how to fetch pool address? from gauge contract? or some on chain registry contract?
      poolId: '0xe2332649955C7c98389480aB46dD4Cb6755aC703'.toLowerCase(), // this is how gauge list is matched to incentives
      totalValue: Number(campaign.totalRewardAmount),
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
          maxValue: 69420,
        },
      ],
    }
  })

  return stakeDaoVoteMarketIncentives
}

async function fetchStakeDaoVoteMarketBalancer(): Promise<StakeDaoVoteMarketResponse> {
  const res = await fetch(STAKEDAO_VOTEMARKET_BALANCER_URL, {
    next: { revalidate: mins(1).toSecs() },
  })

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  return res.json()
}
