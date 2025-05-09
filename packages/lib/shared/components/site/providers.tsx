import { Web3Provider } from '@repo/lib/modules/web3/Web3Provider'
import { ApolloClientProvider } from '@repo/lib/shared/services/api/apollo-client-provider'
import { ReactNode } from 'react'
import { RecentTransactionsProvider } from '@repo/lib/modules/transactions/RecentTransactionsProvider'
import { ApolloGlobalDataProvider } from '@repo/lib/shared/services/api/apollo-global-data.provider'
import { UserSettingsProvider } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { WagmiConfigProvider } from '@repo/lib/modules/web3/WagmiConfigProvider'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/VebalLockDataProvider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfigProvider>
      <Web3Provider>
        <ApolloClientProvider>
          <ApolloGlobalDataProvider>
            <UserSettingsProvider>
              <VebalLockDataProvider>
                <RecentTransactionsProvider>
                  <NuqsAdapter>{children}</NuqsAdapter>
                </RecentTransactionsProvider>
              </VebalLockDataProvider>
            </UserSettingsProvider>
          </ApolloGlobalDataProvider>
        </ApolloClientProvider>
      </Web3Provider>
    </WagmiConfigProvider>
  )
}
