import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetPositionForId(chain: GqlChain, relicId: string) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

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
