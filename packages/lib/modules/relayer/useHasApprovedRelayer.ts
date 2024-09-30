import { getNetworkConfig } from '../../config/app.config'
import { SupportedChainId } from '../../config/config.types'
import { balancerV2VaultAbi } from '../../modules/web3/contracts/abi/generated'
import { useUserAccount } from '../../modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { useChainSwitch } from '../web3/useChainSwitch'

export function useHasApprovedRelayer(chainId: SupportedChainId) {
  const { isConnected, userAddress } = useUserAccount()
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: balancerV2VaultAbi,
    address: config.contracts.balancer.vaultV2,
    account: userAddress,
    functionName: 'hasApprovedRelayer',
    args: [userAddress, config.contracts.balancer.relayerV6],
    query: { enabled: isConnected && !shouldChangeNetwork },
  })

  return {
    ...query,
    hasApprovedRelayer: query.data ?? false,
  }
}