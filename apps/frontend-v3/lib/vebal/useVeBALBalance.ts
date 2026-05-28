import { mainnet } from 'viem/chains'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { InvalidateQueryFilters } from '@tanstack/react-query'
import { veBalAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { Address } from 'viem'

export function useVeBALBalance(accountAddress: Address) {
  const { data, error, isLoading, isError, refetch, queryKey, status } = useReadContract({
    chainId: mainnet.id,
    abi: veBalAbi,
    address: mainnetNetworkConfig.contracts.veBAL,
    functionName: 'balanceOf',
    args: [accountAddress],
    query: { enabled: !!accountAddress },
  })

  return {
    veBALBalance: data || 0n,
    error,
    isError,
    isLoading,
    refetch,
    queryKey: queryKey as InvalidateQueryFilters,
    status,
  }
}
