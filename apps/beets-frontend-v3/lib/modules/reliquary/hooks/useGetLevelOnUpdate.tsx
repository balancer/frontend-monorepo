import { getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'

export function useGetLevelOnUpdate(relicId: string) {
  const { isConnected, chainId } = useUserAccount()
  const { shouldChangeNetwork } = useChainSwitch(chainId!)
  const config = getNetworkConfig(chainId!)

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'levelOnUpdate',
    args: [BigInt(relicId)],
    query: { enabled: isConnected && !shouldChangeNetwork && !!relicId },
  })

  return {
    ...query,
    levelOnUpdate: Number(query.data?.toString()),
  }
}
