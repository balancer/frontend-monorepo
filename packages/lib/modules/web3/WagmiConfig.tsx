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

export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors,
  ssr: true,
})
