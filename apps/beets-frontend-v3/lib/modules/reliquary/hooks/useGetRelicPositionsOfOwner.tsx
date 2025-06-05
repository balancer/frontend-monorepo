import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { formatUnits } from 'viem'
import { ReliquaryPosition } from '../reliquary.types'

export function useGetRelicPositionsOfOwner(chain: GqlChain) {
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: reliquaryAbi,
    address: config.contracts.beets?.reliquary,
    functionName: 'relicPositionsOfOwner',
    args: [userAddress],
    query: { enabled: isConnected && !shouldChangeNetwork && !!userAddress },
  })

  return {
    ...query,
    relics: query.data
      ? query.data[0].map(
          (relicId, index) =>
            ({
              relicId: relicId.toString(),
              amount: formatUnits(query.data[1][index].amount, 18),
              entry: Number(query.data[1][index].entry.toString()),
              poolId: query.data[1][index].poolId.toString(),
              level: Number(query.data[1][index].level.toString()),
            }) as ReliquaryPosition
        )
      : [],
  }
}
