import { Address, isAddress, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

export const usePoolHooksContract = (address?: string) => {
  const isZeroAddress = address === zeroAddress
  const enabled = !!address && isAddress(address) && !isZeroAddress

  const { data: hookFlags, isPending: isValidHooksContractPending } = useReadContract({
    address: address as Address,
    abi: reClammPoolAbi,
    functionName: 'getHookFlags',
    args: [],
    query: { enabled },
  })

  return { isValidHooksContract: !!hookFlags, isValidHooksContractPending, hookFlags }
}
