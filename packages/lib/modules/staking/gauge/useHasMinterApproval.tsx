import { useReadContract } from 'wagmi'
import { useNetworkConfig } from '../../../config/useNetworkConfig'
import { balancerMinterAbi } from '../../web3/contracts/abi/generated'
import { useUserAccount } from '../../web3/UserAccountProvider'

export function useHasMinterApproval() {
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
    query: { enabled: isConnected },
  })
  return {
    ...query,
    hasMinterApproval: query.data ?? false,
  }
}
