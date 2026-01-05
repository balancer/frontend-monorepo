import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { Address, parseAbi } from 'viem'
import { AddressProvider, PoolType } from '@balancer/sdk'
import { cowAmmPoolAbi } from '@repo/lib/modules/web3/contracts/abi/cowAmmAbi'
import { isCowPool } from '@repo/lib/modules/pool/actions/create/helpers'

type Params = {
  chainId: number
  poolAddress: Address | undefined
  poolType?: PoolType
}

export function useIsPoolInitialized({ chainId, poolAddress, poolType }: Params) {
  const isBalancerV1 = poolType && isCowPool(poolType)

  const {
    data: isV1PoolInitialized,
    isLoading: isLoadingV1,
    refetch: refetchisV1PoolInitialized,
  } = useReadContract({
    address: poolAddress,
    abi: cowAmmPoolAbi,
    functionName: 'isFinalized',
    chainId,
    query: { enabled: !!poolAddress && isBalancerV1 },
  })

  const {
    data: isV3PoolInitialized,
    isLoading: isLoadingV3,
    refetch: refetchIsV3PoolInitialized,
  } = useReadContract({
    chainId,
    abi: parseAbi(['function isPoolInitialized(address) view returns (bool)']),
    address: AddressProvider.Vault(chainId),
    functionName: 'isPoolInitialized',
    args: poolAddress ? [poolAddress] : undefined,
    query: { enabled: !!poolAddress && !isBalancerV1 },
  })

  const isPoolInitialized = isBalancerV1 ? !!isV1PoolInitialized : !!isV3PoolInitialized
  const isLoadingPoolInitialized = isBalancerV1 ? isLoadingV1 : isLoadingV3
  const refetchIsPoolInitialized = isBalancerV1
    ? refetchisV1PoolInitialized
    : refetchIsV3PoolInitialized

  return { isPoolInitialized, isLoadingPoolInitialized, refetchIsPoolInitialized }
}
