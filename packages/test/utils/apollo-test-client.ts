import '@repo/lib/test/utils/silence-devtools'
import { ApolloClient, DefaultOptions, HttpLink, InMemoryCache } from '@apollo/client'
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev'

// Adds apollo debug error messages only in test environment
loadDevMessages()
loadErrorMessages()

const cache = new InMemoryCache()

const defaultHeaders = {
  'x-graphql-client-name': 'FrontendClient',
  'x-graphql-client-version': '1.0.0',
}

const link = new HttpLink({
  uri: process.env.NEXT_PUBLIC_BALANCER_API_URL,
  headers: defaultHeaders,
})

// Disable cache in unit tests
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

export const apolloTestClient = new ApolloClient({
  cache,
  link,
  defaultOptions,
})
