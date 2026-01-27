import { GqlChain } from '../services/api/generated/graphql'
import { ChainId } from '@balancer/sdk'

const chainToDrpcName: Partial<Record<GqlChain, string | undefined>> = {
  [GqlChain.Mainnet]: 'ethereum',
  [GqlChain.Arbitrum]: 'arbitrum',
  [GqlChain.Optimism]: 'optimism',
  [GqlChain.Base]: 'base',
  [GqlChain.Polygon]: 'polygon',
  [GqlChain.Avalanche]: 'avalanche',
  [GqlChain.Fantom]: 'fantom',
  [GqlChain.Sepolia]: 'sepolia',
  [GqlChain.Fraxtal]: 'fraxtal',
  [GqlChain.Gnosis]: 'gnosis',
  [GqlChain.Mode]: 'mode',
  [GqlChain.Zkevm]: 'polygon-zkevm',
  [GqlChain.Sonic]: 'sonic',
  [GqlChain.Hyperevm]: 'hyperliquid',
  [GqlChain.Plasma]: 'plasma',
  [GqlChain.Monad]: 'monad',
}

const chainIdToDrpcName: Partial<Record<number, string | undefined>> = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.BASE]: 'base',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.AVALANCHE]: 'avalanche',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.FRAXTAL]: 'fraxtal',
  [ChainId.GNOSIS_CHAIN]: 'gnosis',
  [ChainId.MODE]: 'mode',
  [ChainId.ZKSYNC]: 'polygon-zkevm',
  [ChainId.SONIC]: 'sonic',
  [ChainId.HYPEREVM]: 'hyperliquid',
  [ChainId.PLASMA]: 'plasma',
  [ChainId.MONAD]: 'monad',
}

export function drpcUrl(chain: GqlChain, privateKey: string) {
  const chainSlug = chainToDrpcName[chain]
  if (!chainSlug) throw new Error(`Invalid chain: ${chain}`)
  return `https://lb.drpc.live/${chainSlug}/${privateKey}`
}

export function drpcUrlByChainId(chainId: number, privateKey: string) {
  const chainSlug = chainIdToDrpcName[chainId]
  if (!chainSlug) throw new Error(`Invalid chain id: ${chainId}`)
  return `https://lb.drpc.live/${chainSlug}/${privateKey}`
}
