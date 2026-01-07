import {
  PoolVoteIncentivesPerWeek,
  VoteMarketResponse,
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
      const rewardTokenAmount = Number(campaign.currentPeriod.rewardPerPeriod)
      const valuePerToken = Number(campaign.rewardToken.price)
      const rewardPerWeek = rewardTokenAmount * valuePerToken

      const rewardTokenAmountPerVote = Number(campaign.currentPeriod.rewardPerVote)
      const valuePerVote = rewardTokenAmountPerVote * valuePerToken

      return {
        gauge: campaign.gauge.toLowerCase(),
        status: campaign.status,
        totalValue: rewardPerWeek,
        valuePerVote,
        incentives: [
          {
            symbol: campaign.rewardToken.symbol,
            token: campaign.rewardToken.address,
            amount: rewardPerWeek,
            chainId: campaign.rewardChainId,
            value: valuePerToken,
            decimals: campaign.rewardToken.decimals,
            maxTokensPerVote: Number(campaign.maxRewardPerVote),
            briber: campaign.manager,
            isBlacklist: campaign.isBlacklist,
          },
        ],
      }
    })
}

async function fetchStakeDaoVoteMarket(): Promise<VoteMarketResponse> {
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao Votemarket data: ${res.status}`)

  return res.json()
}
