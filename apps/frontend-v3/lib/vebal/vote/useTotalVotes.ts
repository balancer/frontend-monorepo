import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import { Hex } from 'viem'
import { mainnet } from 'viem/chains'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'

export function useTotalVotes() {
  const { data, isLoading } = useReadContract({
    chainId: mainnet.id,
    abi: AbiMap['balancer.gaugeControllerAbi'],
    address: mainnetNetworkConfig.contracts.gaugeController as Hex,
    functionName: 'get_total_weight',
    args: [],
    query: { enabled: true },
  })

  const totalVotes = data || 0n

  return { totalVotes, totalVotesLoading: isLoading }
}
