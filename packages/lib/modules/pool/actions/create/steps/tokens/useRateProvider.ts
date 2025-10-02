import { Address, parseAbi, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useRateProvider(address: Address | '' | undefined, network: GqlChain) {
  const enabled = !!address && address !== zeroAddress

  const { data: rate, isPending: isRatePending } = useReadContract({
    address: address as Address,
    abi: parseAbi(['function getRate() external view returns (uint256)']),
    functionName: 'getRate',
    args: [],
    chainId: getChainId(network),
    query: { enabled },
  })

  return { rate, isRatePending }
}
