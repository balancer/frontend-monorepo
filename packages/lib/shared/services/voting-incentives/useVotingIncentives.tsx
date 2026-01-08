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

      const rewardTokenAmount = Number(campaign.currentPeriod.rewardPerPeriod)
      const valuePerToken = Number(campaign.rewardToken.price)
      const rewardPerWeek = rewardTokenAmount * valuePerToken

      const rewardTokenAmountPerVote = Number(campaign.currentPeriod.rewardPerVote)
      const valuePerVote = rewardTokenAmountPerVote * valuePerToken

      const incentive = {
        symbol: campaign.rewardToken.symbol,
        token: campaign.rewardToken.address,
        amount: rewardPerWeek,
        chainId: campaign.rewardChainId,
        value: valuePerToken,
        decimals: campaign.rewardToken.decimals,
        maxTokensPerVote: Number(campaign.maxRewardPerVote),
        briber: campaign.manager,
      }

      if (!acc[gaugeAddress]) {
        acc[gaugeAddress] = {
          gauge: gaugeAddress,
          totalValue: rewardPerWeek,
          valuePerVote,
          incentives: [incentive],
        }
      } else {
        // Merge with existing gauge entry
        acc[gaugeAddress].totalValue += rewardPerWeek
        acc[gaugeAddress].valuePerVote += valuePerVote
        acc[gaugeAddress].incentives.push(incentive)
      }

      return acc
    },
    {} as Record<string, PoolVotingIncentivesPerWeek>
  )

  return Object.values(campaignsByGauge)
}

async function fetchStakeDaoVoteMarket(): Promise<VoteMarketResponse> {
  console.log('Stake DAO API fetching at', new Date().toISOString())
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao Votemarket data: ${res.status}`)

  return res.json()
}
