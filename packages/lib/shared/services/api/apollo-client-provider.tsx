'use client'

 
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { createApolloClient } from '@repo/lib/shared/services/api/apollo.client'

export function ApolloClientProvider({ children }: React.PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={createApolloClient}>{children}</ApolloNextAppProvider>
}
