import { mainnet } from 'viem/chains'
import { useReadContract } from 'wagmi'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { veBalAbi } from '../../web3/contracts/abi/generated'

export function useVeBALBalance(accountAddress: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    chainId: mainnet.id,
    abi: veBalAbi,
    address: mainnetNetworkConfig.contracts.veBAL,
    functionName: 'balanceOf',
    args: [accountAddress],
    query: { enabled: true },
  })

  return {
    veBALBalance: data || 0n,
    isLoading,
    refetch,
  }
}
