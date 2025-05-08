import { mainnet } from 'wagmi/chains'
import { useConfig } from 'wagmi'

export function useIsChainSupported(chainId?: number): boolean {
  const { chains } = useConfig()
  if (!chainId) return false
  return chains.some(chain => chain.id === chainId)
}

export function useIsMainnetSupported(): boolean {
  return useIsChainSupported(mainnet.id)
}
