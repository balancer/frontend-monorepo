import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
  useQuery as useApolloQuery,
} from '@apollo/client'
import { Address } from 'viem'

export interface OmniEscrowLock {
  id: string
  localUser: {
    id: string
  }
  remoteUser: string
  bias: string
  slope: string
  dstChainId: number // Layer Zero chain ID
}

export interface OmniEscrowLockResponse {
  omniVotingEscrowLocks: OmniEscrowLock[]
}

const SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/91429265f2a0b1852cd6665ce5fa6a3e/subgraphs/id/4sESujoqmztX6pbichs4wZ1XXyYrkooMuHA8sKkYxpTn`

// Create ApolloClient instance at the module level
const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
})

const GET_OMNI_ESCROW_LOCKS = gql`
  query GetOmniEscrowLocks($localUser: String!) {
    omniVotingEscrowLocks(where: { localUser: $localUser }) {
      id
      localUser {
        id
      }
      remoteUser
      bias
      slope
      dstChainId
    }
  }
`

export function useOmniEscrowLocksQuery(userAddress: Address) {
  const { data, loading, error, refetch } = useApolloQuery<
    OmniEscrowLockResponse,
    { localUser: string }
  >(GET_OMNI_ESCROW_LOCKS, {
    client: apolloClient,
    variables: {
      localUser: userAddress ? userAddress.toLowerCase() : '',
    },
    skip: !userAddress,
  })

  return {
    data: data || { omniVotingEscrowLocks: [] },
    isLoading: loading,
    error,
    refetch,
  }
}
