import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '../../web3/UserAccountProvider'

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
      const balancerRewards = result.data.filter(reward => reward.protocol === 'balancer')
      const totalValueUsd = balancerRewards.reduce((sum, reward) => sum + reward.value, 0)

      return {
        ...result,
        data: balancerRewards,
        totalValueUsd,
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
