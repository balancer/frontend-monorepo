import type { GqlChain } from '../services/api/generated/graphql'
import { GqlChainValues } from '../services/api/generated/graphql-enums'
import { ChainId } from '@balancer/sdk'

const chainToDrpcName: Partial<Record<GqlChain, string | undefined>> = {
  [GqlChainValues.Mainnet]: 'ethereum',
  [GqlChainValues.Arbitrum]: 'arbitrum',
  [GqlChainValues.Optimism]: 'optimism',
  [GqlChainValues.Base]: 'base',
  [GqlChainValues.Polygon]: 'polygon',
  [GqlChainValues.Avalanche]: 'avalanche',
  [GqlChainValues.Fantom]: 'fantom',
  [GqlChainValues.Sepolia]: 'sepolia',
  [GqlChainValues.Fraxtal]: 'fraxtal',
  [GqlChainValues.Gnosis]: 'gnosis',
  [GqlChainValues.Mode]: 'mode',
  [GqlChainValues.Zkevm]: 'polygon-zkevm',
  [GqlChainValues.Sonic]: 'sonic',
  [GqlChainValues.Hyperevm]: 'hyperliquid',
  [GqlChainValues.Plasma]: 'plasma',
  [GqlChainValues.Monad]: 'monad',
  [GqlChainValues.Xlayer]: 'xlayer',
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
  [ChainId.X_LAYER]: 'xlayer',
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
