import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { Pool } from '../../pool/PoolProvider'
import { MerklRewardsSchema } from './merkl.types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useHasMerklRewards(poolsWithOnchainUserBalances: Pool[]) {
  const { userAddress, isConnected } = useUserAccount()

  const queryFn = async () => {
    const response = await fetch(`https://api.merkl.xyz/v3/rewards?user=${userAddress}`)
    const rewards: MerklRewardsSchema = await response.json()

    /*
  const hasMerklRewards = poolsWithOnchainUserBalances.some(pool => {
    if (!rewards) return false
    const campaignData = rewards[getChainId(pool.chain)].campaignData
    // MATCH campaignId with poolId (not available at the moment)
    // In the future we would expect to have a dedicated endpoint with the matching between balancer pool id and campaign id
    return false
  })
  */

    if (!rewards) return false

    // If any of the rewards has unclaimed rewards, return true, even if the unclaimed reward does not belong to a balancer pool (see comment above)
    return Object.values(rewards).some(chainCampaigns =>
      Object.values(chainCampaigns.campaignData).some(campaign => {
        return Object.values(campaign).some(entry => {
          return Number(entry?.unclaimed) > 0
        })
      })
    )
  }

  const { data: hasRewards } = useQuery({
    queryKey: ['merkl-rewards', userAddress],
    queryFn,
    enabled: isConnected,
  })

  return { hasMerklRewards: !!hasRewards }
}
