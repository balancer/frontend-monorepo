import { useIsHyperEvm } from './useIsHyperEvm'
import { ChainId } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { useAccount } from 'wagmi'

export const useIsUsingBigBlocks = () => {
  const isHyperEvm = useIsHyperEvm()
  const publicClient = usePublicClient()
  const { address } = useAccount()

  const { data: isUsingBigBlocks, refetch: refetchIsUsingBigBlocks } = useQuery({
    queryKey: ['isUsingBigBlocks', publicClient?.chain.id, address],
    queryFn: async () => {
      if (!publicClient || !address) return false
      if (publicClient.chain.id !== ChainId.HYPER_EVM) return false

      const isUsingBigBlocks: boolean = await publicClient.transport.request({
        method: 'eth_usingBigBlocks',
        params: [address],
      })
      return isUsingBigBlocks
    },
    enabled: isHyperEvm,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  return { isUsingBigBlocks, refetchIsUsingBigBlocks }
}
