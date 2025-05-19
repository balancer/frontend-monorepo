'use client'

import { AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit, Metadata } from '@reown/appkit/react'
import { ReactQueryClientProvider } from '@repo/lib/shared/app/react-query.provider'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { PropsWithChildren } from 'react'
import { WagmiProvider } from 'wagmi'
import { UserSettingsProvider } from '../user/settings/UserSettingsProvider'
import { AcceptPoliciesModal } from './AcceptPoliciesModal'
import { BlockedAddressModal } from './BlockedAddressModal'
import { UserAccountProvider } from './UserAccountProvider'
import { useWagmiSetup } from './WagmiSetupProvider'
import { chainImagesById } from '@repo/lib/modules/web3/ChainConfig'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isProd } from '@repo/lib/config/app.config'

export function Web3Provider({ children }: PropsWithChildren) {
  const isMounted = useIsMounted()

  const { wagmiSetup: wagmiAdapter } = useWagmiSetup()

  const metadata: Metadata | undefined = isProd
    ? {
        name: PROJECT_CONFIG.projectName,
        description: '',
        url: PROJECT_CONFIG.projectUrl,
        icons: [PROJECT_CONFIG.projectLogo],
      }
    : undefined

  createAppKit({
    adapters: [wagmiAdapter],
    projectId: wagmiAdapter.projectId ?? '',
    networks: wagmiAdapter.wagmiConfig.chains as unknown as [AppKitNetwork, ...AppKitNetwork[]],
    enableWalletGuide: false,
    features: {
      email: false,
      socials: false,
      legalCheckbox: true,
      swaps: false,
      send: false,
      pay: false,
      onramp: false,
    },
    metadata,
    chainImages: chainImagesById,
    // https://docs.reown.com/appkit/react/core/theming#themevariables
    // TODO: customize other theme variables??
    themeVariables: {
      '--w3m-z-index': 999999,
    },
    featuredWalletIds: [
      /* Add featured wallet ids from this list:
        https://walletguide.walletconnect.network/
      */
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      'a9751f17a3292f2d1493927f0555603d69e9a3fcbcdf5626f01b49afa21ced91', // Frame
      // '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
      // '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
    ],
  })

  /*
    Avoids warning (Warning: Prop `dangerouslySetInnerHTML` did not match. Server...)
    when customTheme changes from default (dark) to light theme while mounting.
  */
  if (!isMounted) return null

  return (
    <ReactQueryClientProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <UserAccountProvider>
          <UserSettingsProvider
            initAcceptedPolicies={undefined}
            initCurrency={undefined}
            initEnableSignatures={undefined}
            initPoolListView={undefined}
            initSlippage={undefined}
          >
            {children}
            <BlockedAddressModal />
            <AcceptPoliciesModal />
          </UserSettingsProvider>
        </UserAccountProvider>
      </WagmiProvider>
    </ReactQueryClientProvider>
  )
}
