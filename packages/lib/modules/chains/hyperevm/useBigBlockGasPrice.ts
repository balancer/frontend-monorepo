import { useIsHyperEvm } from './useIsHyperEvm'
import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

export const useBigBlockGasPrice = () => {
  const isHyperEvm = useIsHyperEvm()
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ['bigBlockGasPrice', publicClient?.chain.id],
    queryFn: async () => {
      if (!publicClient)
        throw new Error('Failed to fetch bigBlockGasPrice because public client not found')

      const bigBlockGasPrice: bigint = await publicClient.transport.request({
        method: 'eth_bigBlockGasPrice',
      })
      return bigBlockGasPrice
    },
    enabled: isHyperEvm,
  })
}
