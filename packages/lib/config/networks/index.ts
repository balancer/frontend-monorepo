import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
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
import plasma from './plasma'
import monad from './monad'
import xlayer from './xlayer'

export type GqlChainValues = `${GqlChain}`
export type NetworkConfigs = Partial<Record<GqlChainValues, NetworkConfig>>

const networkConfigs: NetworkConfigs = {
  [GqlChainValues.Arbitrum]: arbitrum,
  [GqlChainValues.Avalanche]: avalanche,
  [GqlChainValues.Base]: base,
  [GqlChainValues.Gnosis]: gnosis,
  [GqlChainValues.Mainnet]: mainnet,
  [GqlChainValues.Polygon]: polygon,
  [GqlChainValues.Zkevm]: zkevm,
  [GqlChainValues.Optimism]: optimism,
  [GqlChainValues.Sepolia]: sepolia,
  [GqlChainValues.Mode]: mode,
  [GqlChainValues.Fraxtal]: fraxtal,
  [GqlChainValues.Fantom]: fantom,
  [GqlChainValues.Sonic]: sonic,
  [GqlChainValues.Hyperevm]: hyperevm,
  [GqlChainValues.Plasma]: plasma,
  [GqlChainValues.Monad]: monad,
  [GqlChainValues.Xlayer]: xlayer,
}

export function getNetworkConfig(chain: GqlChain) {
  const networkConfig = networkConfigs[chain]
  if (!networkConfig) throw new Error(`Missing network config for chain ${chain}`)

  return networkConfig
}

export default networkConfigs
