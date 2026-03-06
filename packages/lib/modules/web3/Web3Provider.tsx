'use client'
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, Theme, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { ReactQueryClientProvider } from '@repo/lib/shared/app/react-query.provider'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { merge } from 'lodash'
import { UserSettingsProvider } from '../user/settings/UserSettingsProvider'
import { AcceptPoliciesModal } from './AcceptPoliciesModal'
import { BlockedAddressModal } from './BlockedAddressModal'
import { CustomAvatar } from './CustomAvatar'
import { UserAccountProvider } from './UserAccountProvider'
import { PropsWithChildren } from 'react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useWagmiConfig } from './WagmiConfigProvider'
import { colors } from '@repo/lib/shared/services/chakra/themes/base/colors'

export function Web3Provider({ children }: PropsWithChildren) {
  const isMounted = useIsMounted()
  const colorMode = useThemeColorMode()
  const { wagmiConfig } = useWagmiConfig()

  /*
    Avoids warning (Warning: Prop `dangerouslySetInnerHTML` did not match. Server...)
    when customTheme changes from default (dark) to light theme while mounting.
  */
  if (!isMounted) return null

  const isDark = colorMode === 'dark'

  const sharedConfig = {
    fonts: {
      body: 'inherit',
    },
    radii: {
      connectButton: '0.375rem',
      actionButton: '0.375rem',
      menuButton: '0.375rem',
      modal: '0.375rem',
      modalMobile: '0.375rem',
    },
    shadows: {
      connectButton: '0px 3px 6px rgba(0,0,0,0.08)',
      dialog: '0px 8px 24px rgba(0,0,0,0.16)',
      profileDetailsAction: '0px 3px 6px rgba(0,0,0,0.08)',
      selectedOption: '0px 3px 6px rgba(0,0,0,0.08)',
      selectedWallet: '0px 3px 6px rgba(0,0,0,0.08)',
      walletLogo: '0px 3px 6px rgba(0,0,0,0.08)',
    },
    colors: {
      accentColor: colors.purple['500'],
      modalBackground: isDark ? '#31373F' : '#EBE8E0',
      modalText: isDark ? '#E5D3BE' : '#2D3748',
    },
  }

  const _lightTheme = merge(lightTheme(), { ...sharedConfig } as Theme)
  const _darkTheme = merge(darkTheme(), { ...sharedConfig } as Theme)
  const customTheme = isDark ? _darkTheme : _lightTheme

  return (
    <ReactQueryClientProvider>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider avatar={CustomAvatar} theme={customTheme}>
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
        </RainbowKitProvider>
      </WagmiProvider>
    </ReactQueryClientProvider>
  )
}
