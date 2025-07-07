import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { Address, parseAbi } from 'viem'
import { balancerV3Contracts } from '@balancer/sdk'

export function useIsPoolInitialized(chainId: number, poolAddress: Address | undefined) {
  return useReadContract({
    chainId,
    abi: parseAbi(['function isPoolInitialized(address) view returns (bool)']),
    address: balancerV3Contracts.Vault[chainId as keyof typeof balancerV3Contracts.Vault],
    functionName: 'isPoolInitialized',
    args: poolAddress ? [poolAddress] : undefined,
    query: { enabled: !!poolAddress },
  })
}
