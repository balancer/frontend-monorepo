import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '../services/api/generated/graphql'

const defaultChain = getProjectConfig().defaultNetwork

export function getBlockExplorerName(chain?: GqlChain) {
  const _chain = chain || defaultChain
  return getNetworkConfig(_chain).blockExplorer.name
}

function getBlockExplorerUrl(chain: GqlChain) {
  return `${getNetworkConfig(chain).blockExplorer.baseUrl}`
}

export function getBlockExplorerTxUrl(txHash: string, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/tx/${txHash}`
}

export function getBlockExplorerAddressUrl(address: string, chain?: GqlChain) {
  const _chain = chain || defaultChain
  return `${getBlockExplorerUrl(_chain)}/address/${address}`
}

export function useBlockExplorer(chain?: GqlChain) {
  const { blockExplorer } = useNetworkConfig()

  const baseUrl = chain ? getNetworkConfig(chain).blockExplorer.baseUrl : blockExplorer.baseUrl

  function getBlockExplorerTxUrl(txHash: string) {
    return `${baseUrl}/tx/${txHash}`
  }

  function getBlockExplorerAddressUrl(address: string) {
    return `${baseUrl}/address/${address}`
  }

  function getBlockExplorerTokenUrl(address: string) {
    return `${baseUrl}/token/${address}`
  }

  function getBlockExplorerBlockUrl(block: number) {
    return `${baseUrl}/block/${block}`
  }

  return {
    getBlockExplorerTxUrl,
    getBlockExplorerAddressUrl,
    getBlockExplorerTokenUrl,
    getBlockExplorerBlockUrl,
  }
}
