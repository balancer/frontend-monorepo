import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'

export function useGetPositionForId(relicId: string) {
  const { chain } = useReliquary()
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)
  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const { isConnected } = useUserAccount()

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'getPositionForId',
    args: [BigInt(relicId)],
    query: { enabled: isConnected && !shouldChangeNetwork && !!relicId },
  })

  return {
    ...query,
    position: {
      ...query.data,
      level: query.data?.level.toString(),
      poolId: query.data?.poolId.toString(),
      entry: Number(query.data?.entry.toString()),
    },
  }
}
