import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { balancerMinterAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'

export function useHasMinterApproval(hasUnclaimedBalRewards: boolean) {
  const { isConnected, userAddress } = useUserAccount()

  const networkConfig = useNetworkConfig()
  const { chainId, contracts } = networkConfig

  const query = useReadContract({
    chainId,
    abi: balancerMinterAbi,
    address: contracts.balancer.minter,
    account: userAddress,
    functionName: 'getMinterApproval',
    args: [contracts.balancer.relayerV6, userAddress],
    query: { enabled: isConnected && hasUnclaimedBalRewards },
  })

  return {
    ...query,
    hasMinterApproval: query.data ?? false,
  }
}
