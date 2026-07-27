'use client'

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { createApolloClient } from '@repo/lib/shared/services/api/apollo.client'

/**
 * `persistKey` is an opt-in for `localStorage`-backed Apollo cache
 * persistence (see `apollo.client.ts`). Pass it from read-only dashboards
 * to make warm-tab loads near-free; leave it unset on apps with wallet
 * actions where stale cache could mislead the user.
 */
export function ApolloClientProvider({
  children,
  persistKey,
}: React.PropsWithChildren<{ persistKey?: string }>) {
  return (
    <ApolloNextAppProvider makeClient={() => createApolloClient({ persistKey })}>
      {children}
    </ApolloNextAppProvider>
  )
}
