import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from 'wagmi/chains'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
if (!walletConnectProjectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID env')

export const basicConfig = getDefaultConfig({
  appName: 'DEBUG app',
  projectId: walletConnectProjectId,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
})
