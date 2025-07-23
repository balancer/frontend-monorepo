import { config } from '@repo/lib/config/app.config'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

type ClientHeaders = {
  'x-graphql-client-name': string
  'x-graphql-client-version': string
  'x-request-id'?: string
}

const defaultHeaders: ClientHeaders = {
  'x-graphql-client-name': 'FrontendClient',
  'x-graphql-client-version': '1.0.0',
}

const createApolloClient = (options: { bustCache?: boolean } = {}) => {
  const { bustCache = false } = options

  const headers = { ...defaultHeaders }

  if (bustCache) {
    headers['x-request-id'] = `app-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
  }

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        GqlVotingPool: {
          keyFields: ['id', 'gauge', ['address']],
        },
      },
    }),
    link: new HttpLink({
      uri: config.apiUrl,
      headers,
    }),
  })
}

// Register the default client (without cache busting)
export const { getClient: getApolloServerClient } = registerApolloClient(() => createApolloClient())

// Export a function for creating clients with optional cache busting
export function getApolloServerClientWithOptions(options: { bustCache?: boolean } = {}) {
  return createApolloClient(options)
}
