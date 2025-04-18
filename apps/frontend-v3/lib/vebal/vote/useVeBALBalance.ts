import { mainnet } from 'viem/chains'
import { useReadContract } from 'wagmi'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { InvalidateQueryFilters } from '@tanstack/react-query'
import { veBalAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

export function useVeBALBalance(accountAddress: `0x${string}`) {
  const { data, isLoading, refetch, queryKey } = useReadContract({
    chainId: mainnet.id,
    abi: veBalAbi,
    address: mainnetNetworkConfig.contracts.veBAL,
    functionName: 'balanceOf',
    args: [accountAddress],
    query: { enabled: !!accountAddress },
  })

  return {
    veBALBalance: data || 0n,
    isLoading,
    refetch,
    queryKey: queryKey as InvalidateQueryFilters,
  }
}
