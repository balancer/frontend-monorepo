'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, Theme, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { ReactQueryClientProvider } from '@repo/lib/shared/app/react-query.provider'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { useTheme } from '@chakra-ui/react'
import { merge } from 'lodash'
import { UserSettingsProvider } from '../user/settings/UserSettingsProvider'
import { AcceptPoliciesModal } from './AcceptPoliciesModal'
import { BlockedAddressModal } from './BlockedAddressModal'
import { CustomAvatar } from './CustomAvatar'
import { UserAccountProvider } from './UserAccountProvider'
import { PropsWithChildren } from 'react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useWagmiConfig } from './WagmiConfigProvider'

export function Web3Provider({ children }: PropsWithChildren) {
  const isMounted = useIsMounted()

  const { colors, radii, shadows, semanticTokens, fonts } = useTheme()
  const colorMode = useThemeColorMode()
  const colorModeKey = colorMode === 'light' ? 'default' : '_dark'

  const { wagmiConfig } = useWagmiConfig()

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
