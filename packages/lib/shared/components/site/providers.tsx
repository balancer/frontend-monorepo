import { Web3Provider } from '@repo/lib/modules/web3/Web3Provider'
import { ApolloClientProvider } from '@repo/lib/shared/services/api/apollo-client-provider'
import { ReactNode } from 'react'
import { RecentTransactionsProvider } from '@repo/lib/modules/transactions/RecentTransactionsProvider'
import { ApolloGlobalDataProvider } from '@repo/lib/shared/services/api/apollo-global-data.provider'
import { UserSettingsProvider } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { wagmiConfig } from '@repo/lib/modules/web3/WagmiConfig'
import { GlobalAlertsProvider } from '@repo/lib/shared/components/alerts/GlobalAlertsProvider'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { ProjectConfig } from '@repo/lib/config/config.types'
import { ProjectConfigProvider } from '@repo/lib/config/ProjectConfigProvider'

export function Providers({ config, children }: { config: ProjectConfig; children: ReactNode }) {
  return (
    <ProjectConfigProvider config={config}>
      <GlobalAlertsProvider>
        <Web3Provider wagmiConfig={wagmiConfig}>
          <ApolloClientProvider>
            <ApolloGlobalDataProvider>
              <UserSettingsProvider>
                <VebalLockDataProvider>
                  <RecentTransactionsProvider>{children}</RecentTransactionsProvider>
                </VebalLockDataProvider>
              </UserSettingsProvider>
            </ApolloGlobalDataProvider>
          </ApolloClientProvider>
        </Web3Provider>
      </GlobalAlertsProvider>
    </ProjectConfigProvider>
  )
}
