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
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { keyBy } from 'lodash'
import { getBaseUrl } from '@repo/lib/shared/utils/urls'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { defaultAnvilForkRpcUrl } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { hyperEVM } from '@balancer/sdk'

/* If a request with the default rpc fails, it will fall back to the next one in the list.
  https://viem.sh/docs/clients/transports/fallback#fallback-transport
*/
export const rpcFallbacks: Partial<Record<GqlChain, string | undefined>> = {
  [GqlChainValues.Mainnet]: 'https://1rpc.io/eth',
  [GqlChainValues.Arbitrum]: 'https://1rpc.io/arb',
  [GqlChainValues.Base]: 'https://1rpc.io/base',
  [GqlChainValues.Avalanche]: 'https://1rpc.io/avax/c',
  [GqlChainValues.Fantom]: 'https://1rpc.io/ftm',
  [GqlChainValues.Gnosis]: 'https://1rpc.io/gnosis',
  [GqlChainValues.Optimism]: 'https://1rpc.io/op',
  [GqlChainValues.Polygon]: 'https://1rpc.io/matic',
  [GqlChainValues.Zkevm]: 'https://1rpc.io/polygon/zkevm',
  [GqlChainValues.Sepolia]: 'https://1rpc.io/sepolia',
  [GqlChainValues.Mode]: 'https://1rpc.io/mode',
  [GqlChainValues.Fraxtal]: 'https://fraxtal.drpc.org',
  [GqlChainValues.Sonic]: 'https://1rpc.io/sonic',
  [GqlChainValues.Hyperevm]: 'https://1rpc.io/hyperliquid',
  [GqlChainValues.Plasma]: 'https://rpc.plasma.to',
  [GqlChainValues.Monad]: 'https://rpc.monad.xyz',
  [GqlChainValues.Xlayer]: 'https://rpc.xlayer.tech',
}

const baseUrl = getBaseUrl()
const getPrivateRpcUrl = (chain: GqlChain) => {
  // Use anvil fork for E2E dev tests
  if (shouldUseAnvilFork) return defaultAnvilForkRpcUrl
  return `${baseUrl}/api/rpc/${chain}`
}

export const rpcOverrides: Partial<Record<GqlChain, string | undefined>> = {
  [GqlChainValues.Mainnet]: getPrivateRpcUrl(GqlChainValues.Mainnet),
  [GqlChainValues.Arbitrum]: getPrivateRpcUrl(GqlChainValues.Arbitrum),
  [GqlChainValues.Base]: getPrivateRpcUrl(GqlChainValues.Base),
  [GqlChainValues.Avalanche]: getPrivateRpcUrl(GqlChainValues.Avalanche),
  [GqlChainValues.Fantom]: getPrivateRpcUrl(GqlChainValues.Fantom),
  [GqlChainValues.Gnosis]: getPrivateRpcUrl(GqlChainValues.Gnosis),
  [GqlChainValues.Optimism]: getPrivateRpcUrl(GqlChainValues.Optimism),
  [GqlChainValues.Polygon]: getPrivateRpcUrl(GqlChainValues.Polygon),
  [GqlChainValues.Zkevm]: getPrivateRpcUrl(GqlChainValues.Zkevm),
  [GqlChainValues.Sepolia]: getPrivateRpcUrl(GqlChainValues.Sepolia),
  [GqlChainValues.Mode]: getPrivateRpcUrl(GqlChainValues.Mode),
  [GqlChainValues.Fraxtal]: getPrivateRpcUrl(GqlChainValues.Fraxtal),
  [GqlChainValues.Sonic]: getPrivateRpcUrl(GqlChainValues.Sonic),
  [GqlChainValues.Hyperevm]: getPrivateRpcUrl(GqlChainValues.Hyperevm),
  [GqlChainValues.Plasma]: getPrivateRpcUrl(GqlChainValues.Plasma),
  [GqlChainValues.Monad]: getPrivateRpcUrl(GqlChainValues.Monad),
  [GqlChainValues.Xlayer]: getPrivateRpcUrl(GqlChainValues.Xlayer),
}

const gqlChainToWagmiChainMap: Partial<Record<GqlChain, Chain>> = {
  [GqlChainValues.Mainnet]: { iconUrl: '/images/chains/MAINNET.svg', ...mainnet },
  [GqlChainValues.Arbitrum]: { iconUrl: '/images/chains/ARBITRUM.svg', ...arbitrum },
  [GqlChainValues.Base]: { iconUrl: '/images/chains/BASE.svg', ...base },
  [GqlChainValues.Avalanche]: { iconUrl: '/images/chains/AVALANCHE.svg', ...avalanche },
  [GqlChainValues.Fantom]: { iconUrl: '/images/chains/FANTOM.svg', ...fantom },
  [GqlChainValues.Gnosis]: { iconUrl: '/images/chains/GNOSIS.svg', ...gnosis },
  [GqlChainValues.Optimism]: { iconUrl: '/images/chains/OPTIMISM.svg', ...optimism },
  [GqlChainValues.Polygon]: { iconUrl: '/images/chains/POLYGON.svg', ...polygon },
  [GqlChainValues.Zkevm]: { iconUrl: '/images/chains/ZKEVM.svg', ...polygonZkEvm },
  [GqlChainValues.Sepolia]: { iconUrl: '/images/chains/SEPOLIA.svg', ...sepolia },
  [GqlChainValues.Mode]: { iconUrl: '/images/chains/MODE.svg', ...mode },
  [GqlChainValues.Fraxtal]: { iconUrl: '/images/chains/FRAXTAL.svg', ...fraxtal },
  [GqlChainValues.Sonic]: { iconUrl: '/images/chains/SONIC.svg', ...sonic },
  [GqlChainValues.Hyperevm]: { iconUrl: '/images/chains/HYPEREVM.svg', ...(hyperEVM as Chain) }, // TODO: fix type when rainbowkit is updated
  [GqlChainValues.Plasma]: { iconUrl: '/images/chains/PLASMA.svg', ...plasma },
  [GqlChainValues.Monad]: { iconUrl: '/images/chains/MONAD.svg', ...monad },
  [GqlChainValues.Xlayer]: { iconUrl: '/images/chains/XLAYER.svg', ...xLayer },
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
