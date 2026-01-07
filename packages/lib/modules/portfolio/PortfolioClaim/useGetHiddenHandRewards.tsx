import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

const HIDDEN_HAND_API_BASE_URL = 'https://api.hiddenhand.finance/reward/0'

export interface ClaimMetadata {
  identifier: string
  account: string
  amount: string
  merkleProof: string[]
}

export interface HiddenHandRewardData {
  symbol: string
  name: string
  token: string
  decimals: number
  chainId: number
  protocol: string
  claimable: string
  cumulativeAmount: string
  value: number
  activeTimer: number
  pausedTimer: number
  claimMetadata: ClaimMetadata
}

export interface HiddenHandRewardResponse {
  error: boolean
  data: HiddenHandRewardData[]
  totalValueUsd: number
  aggregatedRewards: {
    tokenAddress: string
    claimable: string
    value: number
  }[]
}

export function useGetHiddenHandRewards() {
  const { userAddress, isConnected } = useUserAccount()
  const { usdValueForTokenAddress } = useTokens()

  const query = useQuery<HiddenHandRewardResponse>({
    queryKey: ['hiddenHandRewards', userAddress],
    queryFn: async () => {
      if (!userAddress) {
        throw new Error('User address is required')
      }

      const response = await fetch(`${HIDDEN_HAND_API_BASE_URL}/${userAddress}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch HiddenHand rewards: ${response.statusText}`)
      }

      const result: HiddenHandRewardResponse = await response.json()

      if (result.error || !result.data) {
        throw new Error('HiddenHand API returned an error')
      }

      const filteredRewards = result.data.filter(
        reward => reward.protocol === PROJECT_CONFIG.projectId
      )

      // Return raw data without price calculations
      return {
        ...result,
        data: filteredRewards,
        totalValueUsd: 0, // Will be calculated in select
        aggregatedRewards: [], // Will be calculated in select
      }
    },
    enabled: !!userAddress && isConnected,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
    select: data => {
      // Calculate prices and aggregate outside of queryFn
      const filteredRewards = data.data.filter(reward => bn(reward.claimable).gt(0))

      // Aggregate rewards by token address and calculate USD values
      const aggregatedRewards = filteredRewards.reduce(
        (acc, reward) => {
          const tokenAddress = reward.token
          const rewardTokenUsdValue = usdValueForTokenAddress(
            tokenAddress,
            PROJECT_CONFIG.defaultNetwork,
            reward.claimable
          )

          if (!acc[tokenAddress]) {
            acc[tokenAddress] = {
              tokenAddress,
              claimable: '0',
              value: 0,
            }
          }

          acc[tokenAddress].claimable = bn(acc[tokenAddress].claimable)
            .plus(reward.claimable)
            .toString()

          acc[tokenAddress].value = bn(acc[tokenAddress].value)
            .plus(rewardTokenUsdValue ?? reward.value)
            .toNumber()

          return acc
        },
        {} as Record<string, { tokenAddress: string; claimable: string; value: number }>
      )

      const calculatedTotalValueUsd = Object.values(aggregatedRewards).reduce(
        (sum, reward) => sum + reward.value,
        0
      )

      return {
        ...data,
        totalValueUsd: calculatedTotalValueUsd,
        aggregatedRewards: Object.values(aggregatedRewards).sort((a, b) => b.value - a.value),
      }
    },
  })

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  }
}
