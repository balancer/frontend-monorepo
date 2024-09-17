import { Web3Provider } from '@/lib/modules/web3/Web3Provider'
import { ApolloClientProvider } from '@/lib/shared/services/api/apollo-client-provider'
import { ThemeProvider } from '@/lib/shared/services/chakra/ThemeProvider'
import { ReactNode } from 'react'
import { RecentTransactionsProvider } from '@/lib/modules/transactions/RecentTransactionsProvider'
import { ApolloGlobalDataProvider } from '@/lib/shared/services/api/apollo-global-data.provider'
import { UserSettingsProvider } from '@/lib/modules/user/settings/UserSettingsProvider'
import { ThemeProvider as ColorThemeProvider } from 'next-themes'
import { DEFAULT_THEME_COLOR_MODE } from '@/lib/shared/services/chakra/themes/base/foundations'
import { wagmiConfig } from '@/lib/modules/web3/WagmiConfig'
import { GlobalAlertsProvider } from '@/lib/shared/components/alerts/GlobalAlertsProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ColorThemeProvider defaultTheme={DEFAULT_THEME_COLOR_MODE}>
      <ThemeProvider>
        <GlobalAlertsProvider>
          <Web3Provider wagmiConfig={wagmiConfig}>
            <ApolloClientProvider>
              <ApolloGlobalDataProvider>
                <UserSettingsProvider>
                  <RecentTransactionsProvider>{children}</RecentTransactionsProvider>
                </UserSettingsProvider>
              </ApolloGlobalDataProvider>
            </ApolloClientProvider>
          </Web3Provider>
        </GlobalAlertsProvider>
      </ThemeProvider>
    </ColorThemeProvider>
  )
}
