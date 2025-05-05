'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { createConfig } from 'wagmi'
import { chains } from './ChainConfig'
import { transports } from './transports'
import { createWalletConnectConnector } from './wallet-connect/createWalletConnectConnector'
import { isConnectedToWC } from './wallet-connect/useWCConnectionLocalStorage'
import { createMockConnector } from './impersonation/createMockConnector'
import { Address, fallback, http } from 'viem'
import { isProd, shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { defaultAnvilForkRpcUrl } from '@repo/lib/test/utils/wagmi/fork.helpers'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
if (!walletConnectProjectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID env')

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        // metaMaskWallet must appear above injectedWallet to avoid random disconnection issues
        metaMaskWallet,
        safeWallet,
        rabbyWallet,
        coinbaseWallet,
        rainbowWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: PROJECT_CONFIG.projectName,
    projectId: walletConnectProjectId,
  }
)

/*
  Only adding a new WC Connector if the user is not already connected to WC
  This fixes this rainbowkit issue:
  https://github.com/rainbow-me/rainbowkit/issues/2232
*/
if (!isConnectedToWC()) {
  const lastConnector = connectors[connectors.length - 1]
  if (lastConnector({} as any).id !== 'walletConnect') {
    connectors.push(
      createWalletConnectConnector({ index: connectors.length, walletConnectProjectId })
    )
  }
}

// Add mock connector for development/staging environments
if (!isProd) connectors.push(createMockConnector({ index: connectors.length }))

export type WagmiConfig = ReturnType<typeof createConfig>
export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors,
  ssr: true,
})

/*
  - Updates the mock connector address with the given impersonation address

  - When shouldUseAnvilFork:
    1. updates all chains to use the default Anvil fork RPC URL
    2. updates all transports to use the default Anvil fork RPC URL

  - Returns the updated wagmiConfig to be used for testing
*/
export function impersonateWagmiConfig(impersonationAddress?: Address) {
  console.log('🛠️ Using anvil forks in wagmi chain setup')
  connectors.pop()
  connectors.push(createMockConnector({ index: connectors.length, impersonationAddress }))

  let _transports = transports

  if (shouldUseAnvilFork) {
    /* All chains use the same RPC URL for the Anvil fork for local testing
      For now, E2E dev tests will always run against MAINNET fork
      If needed, this could be easily extended to use different RPC URLs for different chains
     */
    chains.map(chain => (chain.rpcUrls.default.http = [defaultAnvilForkRpcUrl]))
    _transports = Object.fromEntries(
      chains.map(chain => [chain.id, fallback([http(defaultAnvilForkRpcUrl)])])
    )
    console.log(
      'All chains and transports updated to use default Anvil fork RPC URL: ',
      defaultAnvilForkRpcUrl
    )
  }

  const impersonatedConfig = createConfig({
    chains,
    transports: _transports,
    connectors,
    ssr: true,
  })

  return { connectors, updatedConfig: impersonatedConfig }
}
