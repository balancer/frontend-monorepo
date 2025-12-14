import { parseAbi, Address } from 'viem'
import { useReadContract } from 'wagmi'

type Params = {
  poolAddress: Address | undefined
  chainId: number
}

export function useIsCowPoolFinalized({ poolAddress, chainId }: Params) {
  const {
    data: isFinalized,
    isLoading: isLoadingIsFinalized,
    refetch: refetchIsFinalized,
  } = useReadContract({
    address: poolAddress,
    abi: parseAbi(['function isFinalized() external view returns (bool isFinalized)']),
    functionName: 'isFinalized',
    chainId,
    query: {
      enabled: !!poolAddress,
    },
  })

  return { isCowPoolFinalized: !!isFinalized, isLoadingIsFinalized, refetchIsFinalized }
}
