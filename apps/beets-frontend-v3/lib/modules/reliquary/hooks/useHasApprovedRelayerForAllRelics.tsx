import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'

export function useHasApprovedRelayerForAllRelics() {
  const { isConnected, userAddress } = useUserAccount()
  const { chain } = useReliquary()

  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const { shouldChangeNetwork } = useChainSwitch(chainId)

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
