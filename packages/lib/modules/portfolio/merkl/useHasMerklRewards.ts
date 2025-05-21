import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Pool } from '../../pool/pool.types'
import { MerklRewardsResponse } from './merkl.types'

export function useHasMerklRewards(poolsWithOnchainUserBalances: Pool[], chainIds: number[]) {
  const { userAddress, isConnected } = useUserAccount()

  const queryFn = async () => {
    // If no chainIds provided, return false
    if (!chainIds || chainIds.length === 0) return false

    // Check rewards for each chain ID
    const hasRewardsPromises = chainIds.map(async chainId => {
      const url = `https://api.merkl.xyz/v4/users/${userAddress}/rewards?chainId=${chainId}`
      try {
        const response = await fetch(url)
        const rewards = (await response.json()) as MerklRewardsResponse

        /*
    const hasMerklRewards = poolsWithOnchainUserBalances.some(pool => {
      if (!rewards) return false
      // In the future we would expect to have a dedicated endpoint with the matching between balancer pool id and campaign id
      return false
    })
    */

        if (!rewards || !Array.isArray(rewards)) return false

        // If any of the rewards has pending rewards or unclaimed amounts, return true
        return rewards.some(chainRewards => {
          return chainRewards.rewards.some(reward => {
            // Check if there are any pending rewards
            const pendingAmount = Number(reward.pending || 0)
            const unclaimedAmount = Number(reward.amount || 0) - Number(reward.claimed || 0)
            return pendingAmount > 0 || unclaimedAmount > 0
          })
        })
      } catch (error) {
        console.error(`Error fetching Merkl rewards for chain ${chainId}:`, error)
        return false
      }
    })

    // Wait for all promises to resolve and check if any chain has rewards
    const results = await Promise.all(hasRewardsPromises)
    return results.some(hasRewards => hasRewards)

    /*
    // For future implementation:
    // This would match pool IDs with campaign IDs once that data is available
    const hasMerklRewards = poolsWithOnchainUserBalances.some(pool => {
      // Check if the pool has associated merkl rewards
      // In the future we would expect to have a dedicated endpoint with the matching 
      // between balancer pool id and campaign id
      return false
    })
    */
  }

  const { data: hasRewards } = useQuery({
    queryKey: ['merkl-rewards', userAddress, chainIds],
    queryFn,
    enabled: isConnected,
  })

  return { hasMerklRewards: !!hasRewards }
}
