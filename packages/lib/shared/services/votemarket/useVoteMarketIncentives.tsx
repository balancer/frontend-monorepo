import {
  PoolVoteIncentives,
  StakeDaoVoteMarketResponse,
  Balancer,
} from '@repo/lib/shared/services/votemarket/votemarket.types'
import { mins } from '@repo/lib/shared/utils/time'
import { useQuery } from '@tanstack/react-query'

const STAKEDAO_VOTEMARKET_URL = 'https://votemarket-api.contact-69d.workers.dev/votemarket/balancer'
const BALANCER_GAUGES_URL = 'https://votemarket-api.contact-69d.workers.dev/balancer/gauges'

export function useVoteMarketIncentives() {
  const queryKey = ['votemarket-incentives']

  const queryFn = async () => getAllVoteMarketsIncentives()

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

async function getAllVoteMarketsIncentives() {
  const stakeDaoIncentives = await getStakeDaoIncentives()

  return stakeDaoIncentives
}

async function getStakeDaoIncentives(): Promise<PoolVoteIncentives[]> {
  const [stakeDaoResponse, balancerGaugesResponse] = await Promise.all([
    fetchStakeDaoVoteMarket(),
    fetchBalancerGauges(),
  ])

  const gaugeToPoolIdMap = new Map(
    balancerGaugesResponse.gauges.map(gauge => [
      gauge.gauge.toLowerCase(),
      gauge.lp.address.toLowerCase(),
    ])
  )

  return stakeDaoResponse.campaigns
    .filter(campaign => campaign.status.voteOpen)
    .map(campaign => ({
      poolId: gaugeToPoolIdMap.get(campaign.gauge.toLowerCase()) || '',
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
        },
      ],
    }))
}

async function fetchStakeDaoVoteMarket(): Promise<StakeDaoVoteMarketResponse> {
  const res = await fetch(STAKEDAO_VOTEMARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao votemarket: ${res.status}`)

  return res.json()
}

async function fetchBalancerGauges(): Promise<Balancer> {
  const res = await fetch(BALANCER_GAUGES_URL)

  if (!res.ok) throw new Error(`Failed to fetch Balancer gauges: ${res.status}`)

  return res.json()
}
