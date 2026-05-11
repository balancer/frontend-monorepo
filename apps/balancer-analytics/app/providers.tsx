import { ApolloClientProvider } from '@repo/lib/shared/services/api/apollo-client-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'

// Slim provider tree for the analytics app: Apollo for api-v3, nuqs for URL
// state. Wagmi / Web3 / vebal / portfolio providers are deliberately omitted
// because the analytics surface is read-only.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloClientProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </ApolloClientProvider>
  )
}
