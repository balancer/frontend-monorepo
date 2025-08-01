import {
  arbitrum,
  avalanche,
  base,
  fantom,
  fraxtal,
  gnosis,
  mainnet,
  mode,
  optimism,
  polygon,
  polygonZkEvm,
  sepolia,
  sonic,
} from 'viem/chains'
import { GqlChain } from '../services/api/generated/graphql'
import { hyperEvm } from '@repo/lib/modules/chains/custom/hyperevm'

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
}

const chainIdToDrpcName: Partial<Record<number, string | undefined>> = {
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [base.id]: 'base',
  [polygon.id]: 'polygon',
  [avalanche.id]: 'avalanche',
  [fantom.id]: 'fantom',
  [sepolia.id]: 'sepolia',
  [fraxtal.id]: 'fraxtal',
  [gnosis.id]: 'gnosis',
  [mode.id]: 'mode',
  [polygonZkEvm.id]: 'polygon-zkevm',
  [sonic.id]: 'sonic',
  [hyperEvm.id]: 'hyperliquid',
}

export function drpcUrl(chain: GqlChain, privateKey: string) {
  const chainSlug = chainToDrpcName[chain]
  if (!chainSlug) throw new Error(`Invalid chain: ${chain}`)
  return `https://lb.drpc.org/ogrpc?network=${chainSlug}&dkey=${privateKey}`
}

export function drpcUrlByChainId(chainId: number, privateKey: string) {
  const chainSlug = chainIdToDrpcName[chainId]
  if (!chainSlug) throw new Error(`Invalid chain id: ${chainId}`)
  return `https://lb.drpc.org/ogrpc?network=${chainSlug}&dkey=${privateKey}`
}
