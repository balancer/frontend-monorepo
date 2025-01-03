import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '../services/api/generated/graphql'
import { defaultNetwork } from '@repo/lib/config/ProjectConfigProvider'

const defaultChain = defaultNetwork

export function getBlockExplorerName(chain?: GqlChain) {
  const _chain = chain || defaultChain
  return getNetworkConfig(_chain).blockExplorer.name
}

export function getBlockExplorerTxUrl(txHash: string, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/tx/${txHash}`
}

export function getBlockExplorerAddressUrl(address: string, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/address/${address}`
}

export function getBlockExplorerTokenUrl(tokenAddress: string, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/token/${tokenAddress}`
}

export function getBlockExplorerBlockUrl(block: number, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/block/${block}`
}

function getBlockExplorerUrl(chain: GqlChain) {
  return `${getNetworkConfig(chain).blockExplorer.baseUrl}`
}
