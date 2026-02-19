'use client'

import { Chain } from '@rainbow-me/rainbowkit'
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
  plasma,
  monad,
  xLayer,
} from 'wagmi/chains'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { keyBy } from 'lodash'
import { getBaseUrl } from '@repo/lib/shared/utils/urls'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { defaultAnvilForkRpcUrl } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { GqlChainValues } from '@repo/lib/config/networks'
import { hyperEVM } from '@balancer/sdk'

/* If a request with the default rpc fails, it will fall back to the next one in the list.
  https://viem.sh/docs/clients/transports/fallback#fallback-transport
*/
export const rpcFallbacks: Partial<Record<GqlChainValues, string | undefined>> = {
  [GqlChain.Mainnet]: 'https://eth.llamarpc.com',
  [GqlChain.Arbitrum]: 'https://arbitrum.llamarpc.com',
  [GqlChain.Base]: 'https://base.llamarpc.com',
  [GqlChain.Avalanche]: 'https://avalanche.drpc.org',
  [GqlChain.Fantom]: 'https://1rpc.io/ftm',
  [GqlChain.Gnosis]: 'https://gnosis.drpc.org',
  [GqlChain.Optimism]: 'https://optimism.drpc.org',
  [GqlChain.Polygon]: 'https://polygon.llamarpc.com',
  [GqlChain.Zkevm]: 'https://polygon-zkevm.drpc.org',
  [GqlChain.Sepolia]: 'https://sepolia.gateway.tenderly.co',
  [GqlChain.Mode]: 'https://mode.drpc.org',
  [GqlChain.Fraxtal]: 'https://fraxtal.drpc.org',
  [GqlChain.Sonic]: 'https://rpc.soniclabs.com',
  [GqlChain.Hyperevm]: 'https://rpc.hyperliquid.xyz/evm',
  [GqlChain.Plasma]: 'https://rpc.plasma.to',
  [GqlChain.Monad]: 'https://rpc.monad.xyz',
  [GqlChain.Xlayer]: 'https://rpc.xlayer.tech',
}

const baseUrl = getBaseUrl()
const getPrivateRpcUrl = (chain: GqlChain) => {
  // Use anvil fork for E2E dev tests
  if (shouldUseAnvilFork) return defaultAnvilForkRpcUrl
  return `${baseUrl}/api/rpc/${chain}`
}

export const rpcOverrides: Partial<Record<GqlChainValues, string | undefined>> = {
  [GqlChain.Mainnet]: getPrivateRpcUrl(GqlChain.Mainnet),
  [GqlChain.Arbitrum]: getPrivateRpcUrl(GqlChain.Arbitrum),
  [GqlChain.Base]: getPrivateRpcUrl(GqlChain.Base),
  [GqlChain.Avalanche]: getPrivateRpcUrl(GqlChain.Avalanche),
  [GqlChain.Fantom]: getPrivateRpcUrl(GqlChain.Fantom),
  [GqlChain.Gnosis]: getPrivateRpcUrl(GqlChain.Gnosis),
  [GqlChain.Optimism]: getPrivateRpcUrl(GqlChain.Optimism),
  [GqlChain.Polygon]: getPrivateRpcUrl(GqlChain.Polygon),
  [GqlChain.Zkevm]: getPrivateRpcUrl(GqlChain.Zkevm),
  [GqlChain.Sepolia]: getPrivateRpcUrl(GqlChain.Sepolia),
  [GqlChain.Mode]: getPrivateRpcUrl(GqlChain.Mode),
  [GqlChain.Fraxtal]: getPrivateRpcUrl(GqlChain.Fraxtal),
  [GqlChain.Sonic]: getPrivateRpcUrl(GqlChain.Sonic),
  [GqlChain.Hyperevm]: getPrivateRpcUrl(GqlChain.Hyperevm),
  [GqlChain.Plasma]: getPrivateRpcUrl(GqlChain.Plasma),
  [GqlChain.Monad]: getPrivateRpcUrl(GqlChain.Monad),
  [GqlChain.Xlayer]: getPrivateRpcUrl(GqlChain.Xlayer),
}

const gqlChainToWagmiChainMap: Partial<Record<GqlChainValues, Chain>> = {
  [GqlChain.Mainnet]: { iconUrl: '/images/chains/MAINNET.svg', ...mainnet },
  [GqlChain.Arbitrum]: { iconUrl: '/images/chains/ARBITRUM.svg', ...arbitrum },
  [GqlChain.Base]: { iconUrl: '/images/chains/BASE.svg', ...base },
  [GqlChain.Avalanche]: { iconUrl: '/images/chains/AVALANCHE.svg', ...avalanche },
  [GqlChain.Fantom]: { iconUrl: '/images/chains/FANTOM.svg', ...fantom },
  [GqlChain.Gnosis]: { iconUrl: '/images/chains/GNOSIS.svg', ...gnosis },
  [GqlChain.Optimism]: { iconUrl: '/images/chains/OPTIMISM.svg', ...optimism },
  [GqlChain.Polygon]: { iconUrl: '/images/chains/POLYGON.svg', ...polygon },
  [GqlChain.Zkevm]: { iconUrl: '/images/chains/ZKEVM.svg', ...polygonZkEvm },
  [GqlChain.Sepolia]: { iconUrl: '/images/chains/SEPOLIA.svg', ...sepolia },
  [GqlChain.Mode]: { iconUrl: '/images/chains/MODE.svg', ...mode },
  [GqlChain.Fraxtal]: { iconUrl: '/images/chains/FRAXTAL.svg', ...fraxtal },
  [GqlChain.Sonic]: { iconUrl: '/images/chains/SONIC.svg', ...sonic },
  [GqlChain.Hyperevm]: { iconUrl: '/images/chains/HYPEREVM.svg', ...hyperEVM },
  [GqlChain.Plasma]: { iconUrl: '/images/chains/PLASMA.svg', ...plasma },
  [GqlChain.Monad]: { iconUrl: '/images/chains/MONAD.svg', ...monad },
  [GqlChain.Xlayer]: { iconUrl: '/images/chains/XLAYER.svg', ...xLayer },
} as const

export const supportedNetworks = PROJECT_CONFIG.supportedNetworks
const chainToFilter = PROJECT_CONFIG.defaultNetwork
const customChain = gqlChainToWagmiChainMap[chainToFilter]
if (!customChain) throw new Error(`Unable to find default chain ${chainToFilter}`)

export const chains: readonly [Chain, ...Chain[]] = [
  customChain,
  ...(supportedNetworks
    .filter(chain => chain !== chainToFilter)
    .map(gqlChain => gqlChainToWagmiChainMap[gqlChain]) as Chain[]),
]

export const chainsByKey = keyBy(chains, 'id')
export function getDefaultRpcUrl(chainId: number) {
  return chainsByKey[chainId].rpcUrls.default.http[0]
}
