import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { formatUnits } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetPositionForId(relicId: string, chain: GqlChain) {
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
    position: query.data
      ? {
          farmId: query.data.poolId.toString(),
          relicId,
          amount: formatUnits(query.data.amount, 18),
          entry: Number(query.data.entry.toString()),
          level: Number(query.data.level.toString()),
        }
      : null,
  }
}
