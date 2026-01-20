import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetLevelOnUpdate(relicId: string, chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)
  const { isConnected } = useUserAccount()

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'levelOnUpdate',
    args: [BigInt(relicId)],
    query: { enabled: isConnected && !!relicId },
  })

  return {
    ...query,
    levelOnUpdate: Number(query.data?.toString()),
  }
}
