import { Address, parseAbi, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'

export function useRateProvider(address: Address | '' | undefined) {
  const enabled = !!address && address !== zeroAddress

  const { data: rate, isPending: isRatePending } = useReadContract({
    address: address as Address,
    abi: parseAbi(['function getRate() external view returns (uint256)']),
    functionName: 'getRate',
    args: [],
    query: { enabled },
  })

  return { rate, isRatePending }
}
