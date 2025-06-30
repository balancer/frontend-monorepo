import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import arbitrum from './arbitrum'
import avalanche from './avalanche'
import gnosis from './gnosis'
import mainnet from './mainnet'
import polygon from './polygon'
import zkevm from './zkevm'
import fantom from './fantom'
import optimism from './optimism'
import base from './base'
import sepolia from './sepolia'
import mode from './mode'
import fraxtal from './fraxtal'
import sonic from './sonic'
import hyperevm from './hyperevm'

export type GqlChainValues = `${GqlChain}`
export type NetworkConfigs = Partial<Record<GqlChainValues, NetworkConfig>>

const networkConfigs: NetworkConfigs = {
  [GqlChain.Arbitrum]: arbitrum,
  [GqlChain.Avalanche]: avalanche,
  [GqlChain.Base]: base,
  [GqlChain.Gnosis]: gnosis,
  [GqlChain.Mainnet]: mainnet,
  [GqlChain.Polygon]: polygon,
  [GqlChain.Zkevm]: zkevm,
  [GqlChain.Optimism]: optimism,
  [GqlChain.Sepolia]: sepolia,
  [GqlChain.Mode]: mode,
  [GqlChain.Fraxtal]: fraxtal,
  [GqlChain.Fantom]: fantom,
  [GqlChain.Sonic]: sonic,
  [GqlChain.Hyperevm]: hyperevm,
}

export function getNetworkConfig(chain: GqlChain) {
  const networkConfig = networkConfigs[chain]
  if (!networkConfig) throw new Error(`Missing network config for chain ${chain}`)

  return networkConfig
}

export default networkConfigs
