import { getNetworkConfig } from '@/lib/config/app.config'
import { useNetworkConfig } from '@/lib/config/useNetworkConfig'
import { GqlChain } from '../services/api/generated/graphql'

export function getBlockExplorerName(chain?: GqlChain) {
  const _chain = chain || GqlChain.Mainnet
  return getNetworkConfig(_chain).blockExplorer.name
}

function getBlockExplorerUrl(chain: GqlChain) {
  return `${getNetworkConfig(chain).blockExplorer.baseUrl}`
}

export function getBlockExplorerTxUrl(txHash: string, chain?: GqlChain) {
  const _chain = chain || GqlChain.Mainnet
  return `${getBlockExplorerUrl(_chain)}/tx/${txHash}`
}

export function getBlockExplorerAddressUrl(address: string, chain?: GqlChain) {
  const _chain = chain || GqlChain.Mainnet
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
