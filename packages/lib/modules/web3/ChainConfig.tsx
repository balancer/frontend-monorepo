'use client'

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
} from '@reown/appkit/networks'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { keyBy } from 'lodash'
import { getBaseUrl } from '@repo/lib/shared/utils/urls'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { shouldUseAnvilFork, getChainId } from '@repo/lib/config/app.config'
import { defaultAnvilForkRpcUrl } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { AppKitNetwork } from '@reown/appkit/networks'

/* If a request with the default rpc fails, it will fall back to the next one in the list.
  https://viem.sh/docs/clients/transports/fallback#fallback-transport
*/
export const rpcFallbacks: Record<GqlChain, string | undefined> = {
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
}

const baseUrl = getBaseUrl()
const getPrivateRpcUrl = (chain: GqlChain) => {
  // Use anvil fork for E2E dev tests
  if (shouldUseAnvilFork) return defaultAnvilForkRpcUrl
  return `${baseUrl}/api/rpc/${chain}`
}

export const rpcOverrides: Record<GqlChain, string | undefined> = {
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
}

const gqlChainToWagmiChainMap = {
  [GqlChain.Mainnet]: mainnet,
  [GqlChain.Arbitrum]: arbitrum,
  [GqlChain.Base]: base,
  [GqlChain.Avalanche]: avalanche,
  [GqlChain.Fantom]: fantom,
  [GqlChain.Gnosis]: gnosis,
  [GqlChain.Optimism]: optimism,
  [GqlChain.Polygon]: polygon,
  [GqlChain.Zkevm]: polygonZkEvm,
  [GqlChain.Sepolia]: sepolia,
  [GqlChain.Mode]: mode,
  [GqlChain.Fraxtal]: fraxtal,
  [GqlChain.Sonic]: sonic,
} as const satisfies Record<GqlChain, AppKitNetwork>

const gqlChainIdToCustomIcon = {
  [GqlChain.Mainnet]: '/images/chains/MAINNET.svg',
  [GqlChain.Arbitrum]: '/images/chains/ARBITRUM.svg',
  [GqlChain.Base]: '/images/chains/BASE.svg',
  [GqlChain.Avalanche]: '/images/chains/AVALANCHE.svg',
  [GqlChain.Fantom]: '/images/chains/FANTOM.svg',
  [GqlChain.Gnosis]: '/images/chains/GNOSIS.svg',
  [GqlChain.Optimism]: '/images/chains/OPTIMISM.svg',
  [GqlChain.Polygon]: '/images/chains/POLYGON.svg',
  [GqlChain.Zkevm]: '/images/chains/ZKEVM.svg',
  [GqlChain.Sepolia]: '/images/chains/SEPOLIA.svg',
  [GqlChain.Mode]: '/images/chains/MODE.svg',
  [GqlChain.Fraxtal]: '/images/chains/FRAXTAL.svg',
  [GqlChain.Sonic]: '/images/chains/SONIC.svg',
} as const satisfies Record<GqlChain, string>

export const chainImagesById = Object.entries(gqlChainIdToCustomIcon).reduce(
  (acc, [gqlChain, iconUrl]) => {
    acc[getChainId(gqlChain as GqlChain)] = iconUrl
    return acc
  },
  {} as Record<string, string>
)

export const supportedNetworks = PROJECT_CONFIG.supportedNetworks
const chainToFilter = PROJECT_CONFIG.defaultNetwork
const customChain = gqlChainToWagmiChainMap[chainToFilter]

export const chains: [AppKitNetwork, ...AppKitNetwork[]] = [
  customChain,
  ...supportedNetworks
    .filter(chain => chain !== chainToFilter)
    .map(gqlChain => gqlChainToWagmiChainMap[gqlChain]),
]

export const chainsByKey = keyBy(chains, 'id')
export function getDefaultRpcUrl(chainId: number) {
  return chainsByKey[chainId].rpcUrls.default.http[0]
}
