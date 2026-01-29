import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export function useUnderlyingToken(wrapperAddress: Address, chainId: number) {
  const { data, isLoading } = useReadContract({
    chainId,
    abi: wrapperAbi,
    address: wrapperAddress,
    functionName: 'token',
  })

  return {
    address: data as Address,
    isLoading,
  }
}

const wrapperAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
]
