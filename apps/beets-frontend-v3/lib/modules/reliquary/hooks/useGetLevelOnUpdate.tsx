import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetLevelOnUpdate(chain: GqlChain, relicId: string) {
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'levelOnUpdate',
    args: [BigInt(relicId)],
    query: { enabled: isConnected && !shouldChangeNetwork && !!userAddress && !!relicId },
  })

  return {
    ...query,
    levelOnUpdate: Number(query.data?.toString()),
  }
}
