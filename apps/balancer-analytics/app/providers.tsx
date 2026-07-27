import { ApolloClientProvider } from '@repo/lib/shared/services/api/apollo-client-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReactNode } from 'react'

// Slim provider tree for the analytics app: Apollo for api-v3, nuqs for URL
// state. Wagmi / Web3 / vebal / portfolio providers are deliberately omitted
// because the analytics surface is read-only.
//
// `persistKey` opts the Apollo cache into localStorage persistence — safe
// here because every query is read-only protocol metrics (no balances,
// approvals, or other state where staleness would mislead the user).
// Warm tabs (revisits within 24h, hard refreshes) skip api-v3 entirely
// for cache-first queries.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloClientProvider persistKey="balancer-analytics-apollo-cache:v1">
      <NuqsAdapter>{children}</NuqsAdapter>
    </ApolloClientProvider>
  )
}
