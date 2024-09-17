'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, Theme, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { ReactQueryClientProvider } from '@/app/react-query.provider'
import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
import { useTheme } from '@chakra-ui/react'
import { merge } from 'lodash'
import { UserSettingsProvider } from '../user/settings/UserSettingsProvider'
import { AcceptPoliciesModal } from './AcceptPoliciesModal'
import { BlockedAddressModal } from './BlockedAddressModal'
import { CustomAvatar } from './CustomAvatar'
import { UserAccountProvider } from './UserAccountProvider'
import { PropsWithChildren } from 'react'
import { WagmiConfig } from './WagmiConfig'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'

export function Web3Provider({
  children,
  wagmiConfig,
}: PropsWithChildren<{ wagmiConfig: WagmiConfig }>) {
  const isMounted = useIsMounted()

  const { colors, radii, shadows, semanticTokens, fonts } = useTheme()
  const colorMode = useThemeColorMode()
  const colorModeKey = colorMode === 'light' ? 'default' : '_dark'

  /*
    Avoids warning (Warning: Prop `dangerouslySetInnerHTML` did not match. Server...)
    when customTheme changes from default (dark) to light theme while mounting.
  */
  if (!isMounted) return null

  const sharedConfig = {
    fonts: {
      body: fonts.body,
    },
    radii: {
      connectButton: radii.md,
      actionButton: radii.md,
      menuButton: radii.md,
      modal: radii.md,
      modalMobile: radii.md,
    },
    shadows: {
      connectButton: shadows.md,
      dialog: shadows.xl,
      profileDetailsAction: shadows.md,
      selectedOption: shadows.md,
      selectedWallet: shadows.md,
      walletLogo: shadows.md,
    },
    colors: {
      accentColor: colors.purple[500],
      // accentColorForeground: '...',
      // actionButtonBorder: '...',
      // actionButtonBorderMobile: '...',
      // actionButtonSecondaryBackground: '...',
      // closeButton: '...',
      // closeButtonBackground: '...',
      // connectButtonBackground: '#000000',
      // connectButtonBackgroundError: '...',
      // connectButtonInnerBackground: '#000000',
      // connectButtonText: '...',
      // connectButtonTextError: '...',
      // connectionIndicator: '...',
      // downloadBottomCardBackground: '...',
      // downloadTopCardBackground: '...',
      // error: '...',
      // generalBorder: '...',
      // generalBorderDim: '...',
      // menuItemBackground: '...',
      // modalBackdrop: '...',
      modalBackground: semanticTokens.colors.background.level0[colorModeKey],
      // modalBorder: '...',
      modalText: semanticTokens.colors.font.primary[colorModeKey],
      // modalTextDim: '...',
      // modalTextSecondary: '...',
      // profileAction: '...',
      // profileActionHover: '...',
      // profileForeground: '...',
      // selectedOptionBorder: '...',
      // standby: '...',
    },
  }

  const _lightTheme = merge(lightTheme(), {
    ...sharedConfig,
  } as Theme)

  const _darkTheme = merge(darkTheme(), {
    ...sharedConfig,
  } as Theme)

  const customTheme = colorMode === 'dark' ? _darkTheme : _lightTheme

  return (
    <ReactQueryClientProvider>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={customTheme} avatar={CustomAvatar}>
          <UserAccountProvider>
            <UserSettingsProvider
              initCurrency={undefined}
              initSlippage={undefined}
              initEnableSignatures={undefined}
              initPoolListView={undefined}
              initAcceptedPolicies={undefined}
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
