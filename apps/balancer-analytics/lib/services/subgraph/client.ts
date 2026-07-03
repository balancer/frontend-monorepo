import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getV3VaultEndpoint } from './endpoints'

const v3VaultClients = new Map<GqlChain, ApolloClient>()

// Per-chain Apollo client for the v3 vault subgraph. We keep a separate client
// per chain (rather than rewriting `uri` per request) so each chain gets its
// own isolated cache — mixing pool IDs across chains would cause keyField
// collisions otherwise. Clients are created lazily and memoized.
export function getV3VaultClient(chain: GqlChain): ApolloClient | null {
  const cached = v3VaultClients.get(chain)
  if (cached) return cached

  const uri = getV3VaultEndpoint(chain)
  if (!uri) return null

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri }),
    queryDeduplication: true,
  })
  v3VaultClients.set(chain, client)
  return client
}
