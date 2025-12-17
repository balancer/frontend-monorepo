import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { Address, parseAbi } from 'viem'
import { AddressProvider } from '@balancer/sdk'

type Params = {
  chainId: number
  poolAddress: Address | undefined
  isEnabled?: boolean
}

export function useIsPoolInitialized({ chainId, poolAddress, isEnabled = true }: Params) {
  const { data: isPoolInitialized, refetch: refetchIsPoolInitialized } = useReadContract({
    chainId,
    abi: parseAbi(['function isPoolInitialized(address) view returns (bool)']),
    address: AddressProvider.Vault(chainId),
    functionName: 'isPoolInitialized',
    args: poolAddress ? [poolAddress] : undefined,
    query: { enabled: isEnabled && !!poolAddress },
  })

  return { isPoolInitialized: !!isPoolInitialized, refetchIsPoolInitialized }
}
