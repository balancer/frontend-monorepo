import { RainbowKitDetails } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { walletConnect, WalletConnectParameters } from 'wagmi/connectors'
import { CreateConnectorFn } from 'wagmi'

type Params = { index: number; walletConnectProjectId: string }

export function createWalletConnectConnector({ index, walletConnectProjectId }: Params) {
  // Default WC RkDetails
  const rkDetails: RainbowKitDetails = {
    id: 'walletConnect',
    name: 'WalletConnect',
    iconBackground: '#3b99fc',
    iconUrl: async () => '/images/logos/walletConnectWallet.svg',
    showQrModal: true,
    index,
    groupIndex: 1,
    groupName: 'Recommended',
    isRainbowKitConnector: true,
    isWalletConnectModalConnector: false,
  }

  const walletConnectParameters: WalletConnectParameters = {
    projectId: walletConnectProjectId,
    showQrModal: true,
    metadata: {
      name: PROJECT_CONFIG.projectName,
      description: '',
      url: PROJECT_CONFIG.projectUrl,
      icons: [PROJECT_CONFIG.projectLogo],
    },
    // Enforce wallet connect popup always on top
    // More info: https://github.com/wevm/wagmi/discussions/2775
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '9999999',
      },
    },
  }

  const wcConnector: CreateConnectorFn = (config: any) => {
    return {
      ...walletConnect(walletConnectParameters)(config),
      rkDetails,
    }
  }

  return wcConnector
}
