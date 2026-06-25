import { GqlChain } from '../services/api/generated/graphql'
import { ChainId } from '@balancer/sdk'

const DRPC_BASE_URL = 'https://lb.drpc.live'
const DIRECT_DEV_BASE_URL = 'https://prod.rpc.direct.dev/v1'

export const chainToRpcName: Partial<Record<GqlChain, string | undefined>> = {
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
  [GqlChain.Xlayer]: 'xlayer',
}

export const chainIdToRpcName: Partial<Record<number, string | undefined>> = {
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

function toDirectDevSlug(slug: string) {
  if (slug === 'sepolia') return 'ethereum-sepolia'
  return slug
}

export function getRpcUrl(chain: GqlChain, key: string) {
  const slug = chainToRpcName[chain]
  if (!slug) throw new Error(`Invalid chain: ${chain}`)
  return `${DIRECT_DEV_BASE_URL}/${key}/${toDirectDevSlug(slug)}`
}

export function getRpcUrlByChainId(chainId: number, key: string) {
  const slug = chainIdToRpcName[chainId]
  if (!slug) throw new Error(`Invalid chain id: ${chainId}`)
  return `${DIRECT_DEV_BASE_URL}/${key}/${toDirectDevSlug(slug)}`
}

export function getDrpcUrl(chain: GqlChain, key: string) {
  const slug = chainToRpcName[chain]
  if (!slug) throw new Error(`Invalid chain: ${chain}`)
  return `${DRPC_BASE_URL}/${slug}/${key}`
}

export function getDrpcUrlByChainId(chainId: number, key: string) {
  const slug = chainIdToRpcName[chainId]
  if (!slug) throw new Error(`Invalid chain id: ${chainId}`)
  return `${DRPC_BASE_URL}/${slug}/${key}`
}
