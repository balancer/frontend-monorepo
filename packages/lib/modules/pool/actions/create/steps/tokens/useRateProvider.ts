import { Address, parseAbi } from 'viem'
import { useReadContract } from 'wagmi'

export function useRateProvider(address: string) {
  const { data: rate, isPending: isRatePending } = useReadContract({
    address: address as Address,
    abi: parseAbi(['function getRate() external view returns (uint256)']),
    functionName: 'getRate',
    args: [],
  })

  return { rate, isRatePending }
}
