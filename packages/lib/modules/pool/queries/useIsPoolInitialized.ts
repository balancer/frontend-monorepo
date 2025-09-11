import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { Address, parseAbi } from 'viem'
import { AddressProvider } from '@balancer/sdk'

export function useIsPoolInitialized(chainId: number, poolAddress: Address | undefined) {
  const { data: isPoolInitialized, refetch: refetchIsPoolInitialized } = useReadContract({
    chainId,
    abi: parseAbi(['function isPoolInitialized(address) view returns (bool)']),
    address: AddressProvider.Vault(chainId),
    functionName: 'isPoolInitialized',
    args: poolAddress ? [poolAddress] : undefined,
    query: { enabled: !!poolAddress },
  })

  return { isPoolInitialized: !!isPoolInitialized, refetchIsPoolInitialized }
}
