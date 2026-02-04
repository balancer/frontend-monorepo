import {
  PoolVotingIncentivesPerWeek,
  VoteMarketResponse,
} from '@repo/lib/shared/services/voting-incentives/incentives.types'
import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useTokens, UseTokensResult } from '@repo/lib/modules/tokens/TokensProvider'
import { getGqlChain } from '@repo/lib/config/app.config'

const STAKE_DAO_VOTE_MARKET_URL = 'https://api-v3.stakedao.org/votemarket/balancer'

type PriceForFn = UseTokensResult['priceFor']

export function useVotingIncentives() {
  const { priceFor, isLoadingTokenPrices } = useTokens()

  const { data, error, isLoading } = useQuery({
    queryKey: ['voting-incentives'],
    queryFn: async () => getAllVotingIncentives(priceFor),
    enabled: !isLoadingTokenPrices,
    ...onlyExplicitRefetch,
  })

  return { incentives: data, incentivesError: error, incentivesAreLoading: isLoading }
}

async function getAllVotingIncentives(
  priceFor: PriceForFn
): Promise<PoolVotingIncentivesPerWeek[]> {
  // add new voting incentive sources here
  const stakeDaoIncentives = await getStakeDaoIncentives(priceFor)

  return [...stakeDaoIncentives]
}

async function getStakeDaoIncentives(priceFor: PriceForFn): Promise<PoolVotingIncentivesPerWeek[]> {
  const stakeDaoVoteMarket = await fetchStakeDaoVoteMarket()

  const voteOpenCampaigns = stakeDaoVoteMarket.campaigns.filter(
    campaign => campaign.status.voteOpen && !campaign.isBlacklist && campaign.addresses.length === 0
  )

  // Group campaigns by gauge address and sum values
  const campaignsByGauge = voteOpenCampaigns.reduce(
    (acc, campaign) => {
      const gaugeAddress = campaign.gauge.toLowerCase()
      const chainId = campaign.rewardChainId
      const chain = getGqlChain(chainId)

      // prioritize price from balancer API with fallback to stake dao API
      const balancerApiTokenPrice = priceFor(campaign.rewardToken.address, chain)
      const stakeDaoTokenPrice = Number(campaign.rewardToken.price)
      const tokenPrice = balancerApiTokenPrice || stakeDaoTokenPrice
      const tokenAmount = Number(campaign.currentPeriod.rewardPerPeriod)
      const fiatValue = tokenAmount * tokenPrice

      const tokenAmountPerVote = Number(campaign.currentPeriod.rewardPerVote)
      const valuePerVote = tokenAmountPerVote * tokenPrice

      const incentive = {
        token: {
          name: campaign.rewardToken.name,
          symbol: campaign.rewardToken.symbol,
          address: campaign.rewardToken.address,
          decimals: campaign.rewardToken.decimals,
          chainId,
          price: tokenPrice,
          amount: tokenAmount,
        },
        maxTokensPerVote: Number(campaign.maxRewardPerVote),
        briber: campaign.manager,
      }

      if (!acc[gaugeAddress]) {
        acc[gaugeAddress] = {
          gauge: gaugeAddress,
          totalValue: fiatValue,
          valuePerVote,
          incentives: [incentive],
        }
      } else {
        acc[gaugeAddress].totalValue += fiatValue
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
  const res = await fetch(STAKE_DAO_VOTE_MARKET_URL)

  if (!res.ok) throw new Error(`Failed to fetch Stake Dao Votemarket data: ${res.status}`)

  return res.json()
}
