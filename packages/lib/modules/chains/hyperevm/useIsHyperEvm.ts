import { ChainId } from '@balancer/sdk'
import { usePublicClient } from 'wagmi'

export const useIsHyperEvm = () => {
  const publicClient = usePublicClient()

  return publicClient?.chain.id === ChainId.HYPER_EVM
}
