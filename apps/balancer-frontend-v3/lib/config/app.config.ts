import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { keyBy } from 'lodash'
import { Config, NetworkConfig, SupportedChainId } from './config.types'
import networks from './networks'

if (!process.env.NEXT_PUBLIC_BALANCER_API_URL) {
  throw new Error(
    `NEXT_PUBLIC_BALANCER_API_URL is missing in your .env vars.
    Please follow the instructions to create .env.local from README.md`
  )
}

export const config: Config = {
  appEnv: (process.env.NEXT_PUBLIC_APP_ENV as Config['appEnv']) || 'dev',
  apiUrl: process.env.NEXT_PUBLIC_BALANCER_API_URL,
  networks,
}

export const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'dev'
export const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'prod'
export const isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

const networksByChainId = keyBy(config.networks, 'chainId')

/**
 * Fetches network config by chainId or network name type from API (GqlChain). If chain
 * param is not provided or incorrect, it will return mainnet config.
 */
export function getNetworkConfig(chain?: GqlChain | number): NetworkConfig {
  if (!chain) return config.networks.MAINNET

  if (typeof chain === 'number') {
    return networksByChainId[chain] || config.networks.MAINNET
  }

  return config.networks[chain]
}

export function getChainId(gqlChain: GqlChain): SupportedChainId {
  return getNetworkConfig(gqlChain).chainId as SupportedChainId
}

export function getGqlChain(chainId: SupportedChainId): GqlChain {
  return getNetworkConfig(chainId).chain
}

export function getNativeAsset(chainId: GqlChain | SupportedChainId) {
  return getNetworkConfig(chainId).tokens.nativeAsset
}

export function getNativeAssetAddress(chainId: GqlChain | SupportedChainId) {
  return getNetworkConfig(chainId).tokens.nativeAsset.address
}

export function getWrappedNativeAssetAddress(chainId: GqlChain | SupportedChainId) {
  return getNetworkConfig(chainId).tokens.addresses.wNativeAsset
}

export function getChainName(chainId: GqlChain | SupportedChainId) {
  return getNetworkConfig(chainId).name
}

export function getChainShortName(chainId: GqlChain | SupportedChainId) {
  return getNetworkConfig(chainId).shortName
}

export const DELEGATE_OWNER = '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b'
