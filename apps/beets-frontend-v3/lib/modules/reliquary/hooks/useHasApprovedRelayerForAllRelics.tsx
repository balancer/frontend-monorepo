import { getNetworkConfig } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'

export function useHasApprovedRelayerForAllRelics(chainId: SupportedChainId) {
  const { isConnected, userAddress } = useUserAccount()
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'isApprovedForAll',
    args: [userAddress, config.contracts.balancer.relayerV6],
    query: { enabled: isConnected && !shouldChangeNetwork },
  })

  return {
    ...query,
    hasApprovedRelayerForAllRelics: query.data ?? false,
  }
}
