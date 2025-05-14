import { config } from '@repo/lib/config/app.config'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

const defaultHeaders = {
  'x-graphql-client-name': 'FrontendClient',
  'x-graphql-client-version': '1.0.0',
}

export const { getClient: getApolloServerClient } = registerApolloClient(() => {
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
      headers: defaultHeaders,
    }),
  })
})
