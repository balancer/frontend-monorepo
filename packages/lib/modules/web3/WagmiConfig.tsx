'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { createConfig } from 'wagmi'
import {
  coinbaseWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { chains } from './ChainConfig'
import { transports } from './transports'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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
        walletConnectWallet,
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
    walletConnectParameters: {
      // Enforce wallet connect popup always on top
      // More info: https://github.com/wevm/wagmi/discussions/2775
      qrModalOptions: {
        themeVariables: {
          '--wcm-z-index': '9999999',
        },
      },
    },
  }
)

export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors,
  ssr: true,
})
