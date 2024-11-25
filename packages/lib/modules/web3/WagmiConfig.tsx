'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { Config, createConfig } from 'wagmi'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
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

const appName = getProjectConfig().projectName
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || ''

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
    appName,
    projectId,
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

export type WagmiConfig = ReturnType<typeof createConfig>
export const wagmiConfig: Config = createConfig({
  chains,
  transports,
  connectors,
  ssr: true,
})
