import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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

      const filteredRewards = result.data.filter(
        reward => reward.protocol === PROJECT_CONFIG.projectName
      )
      const totalValueUsd = filteredRewards.reduce((sum, reward) => sum + reward.value, 0)

      // Aggregate rewards by token address
      const aggregatedRewards = filteredRewards
        .filter(reward => bn(reward.claimable).gt(0))
        .reduce(
          (acc, reward) => {
            const tokenAddress = reward.token
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
            acc[tokenAddress].value += reward.value
            return acc
          },
          {} as Record<string, { tokenAddress: string; claimable: string; value: number }>
        )

      return {
        ...result,
        data: filteredRewards,
        totalValueUsd,
        aggregatedRewards: Object.values(aggregatedRewards).sort((a, b) => b.value - a.value),
      }
    },
    enabled: !!userAddress && isConnected,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  })

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  }
}
