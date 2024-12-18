import { config } from '@repo/lib/config/app.config'
import { ApolloLink, HttpLink } from '@apollo/client'
import {
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support'

/*const userMiddleware = new ApolloLink((operation, forward) => {
  // add the user address to the headers
  operation.setContext(({ headers = {} }) => {
    return {
      headers: {
        ...headers,
        // AccountAddress: SET ACCOUNT ADDRESS,
        // ChainId: SET CHAIN ID,
      },
    }
  })

  return forward(operation)
})*/

export function createApolloClient() {
  //const keyArgs = ['where', ['poolIdIn']]
  const httpLink = new HttpLink({ uri: config.apiUrl })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
    cache: new InMemoryCache({
      typePolicies: {
        GqlToken: {
          keyFields: ['address', 'chainId'],
        },
        GqlTokenPrice: {
          keyFields: ['address', 'chain'],
        },
        GqlUserPoolBalance: {
          keyFields: ['poolId'],
        },
        Query: {
          fields: {
            //poolGetJoinExits: concatPagination(keyArgs),
            //poolGetSwaps: concatPagination(keyArgs),
            //userGetSwaps: concatPagination(keyArgs),
            //poolGetBatchSwaps: concatPagination(),
            userGetPoolBalances: {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              merge(existing = [], incoming: any[]) {
                return incoming
              },
            },
            userGetStaking: {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              merge(existing = [], incoming: any[]) {
                return incoming
              },
            },
            poolGetBatchSwaps: {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              merge(existing = [], incoming: any[]) {
                return incoming
              },
            },
          },
        },
      },
    }),
    queryDeduplication: true,
  })
}
