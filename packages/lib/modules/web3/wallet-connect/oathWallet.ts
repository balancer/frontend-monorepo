import {
  getWalletConnectConnector,
  type Wallet,
  type RainbowKitWalletConnectParameters,
} from '@rainbow-me/rainbowkit'

export const OATH_WALLET_ID = 'oath-wallet'
const APP_STORE_URL = 'https://apps.apple.com/app/id6780187283'

export const oathWallet = ({
  projectId,
  walletConnectParameters,
}: {
  projectId: string
  walletConnectParameters?: RainbowKitWalletConnectParameters
}): Wallet => ({
  id: OATH_WALLET_ID,
  name: 'Oath Wallet',
  iconUrl: '/images/logos/oathWallet.svg',
  iconBackground: '#176BFF',
  downloadUrls: { ios: APP_STORE_URL, qrCode: APP_STORE_URL },
  // Oath is a native iOS wallet. Do not offer an Android app handoff.
  hidden: () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent),
  mobile: { getUri: uri => `oathwallet://wc?uri=${encodeURIComponent(uri)}` },
  qrCode: {
    getUri: uri => uri,
    instructions: {
      learnMoreUrl: 'https://oathwallet.org',
      steps: [
        {
          step: 'install',
          title: 'Open Oath on your iPhone',
          description: 'Open Oath Wallet, or install it from the App Store.',
        },
        {
          step: 'scan',
          title: 'Scan the QR code',
          description: 'Use the QR scanner in Oath to scan this code.',
        },
        {
          step: 'connect',
          title: 'Review the connection',
          description:
            'Check the website and requested networks in Oath, then approve the connection.',
        },
      ],
    },
  },
  createConnector: details => {
    const createConnector = getWalletConnectConnector({
      projectId,
      walletConnectParameters: {
        ...walletConnectParameters,
        // Isolate Oath pairing from sessions established with other wallet entries.
        customStoragePrefix: OATH_WALLET_ID,
      },
    })(details)

    return config => ({
      ...createConnector(config),
      // Keep the identity stable in Wagmi storage and RainbowKit's named wallet UI.
      id: OATH_WALLET_ID,
      name: 'Oath Wallet',
    })
  },
})
