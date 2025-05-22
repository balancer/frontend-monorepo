import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
  useQuery as useApolloQuery,
} from '@apollo/client'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'

export interface VotingEscrowLock {
  id: string
  slope: string
  bias: string
  timestamp: number
  votingEscrowID: {
    id: string
  }
  updatedAt: number
}

interface VotingEscrowLocksResponse {
  votingEscrowLocks: VotingEscrowLock[]
}

// Mainnet subgraph
const SUBGRAPH_URL = `https://gateway-arbitrum.network.thegraph.com/api/91429265f2a0b1852cd6665ce5fa6a3e/subgraphs/id/4sESujoqmztX6pbichs4wZ1XXyYrkooMuHA8sKkYxpTn`

// Create ApolloClient instance at the module level
const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
})

const networkIdMock = '0xc128a9954e6c874ea3d62ce62b468ba073093f25' // mainnet veBAL address

const GET_VOTING_ESCROW_LOCKS = gql`
  query GetVotingEscrowLocks($user: String!, $networkId: String!) {
    votingEscrowLocks(where: { user: $user, votingEscrowID: $networkId }) {
      id
      slope
      bias
      timestamp
      votingEscrowID {
        id
      }
      updatedAt
    }
  }
`

// TODO: Improve when we have definitive way of fetching this data
export type VotingEscrowLocksQueryResponse = ReturnType<typeof useVotingEscrowLocksQuery>

export function useVotingEscrowLocksQuery(userAddress: Address) {
  const { data, loading, error, refetch } = useApolloQuery<
    VotingEscrowLocksResponse,
    { user: string; networkId: string }
  >(GET_VOTING_ESCROW_LOCKS, {
    client: apolloClient,
    variables: {
      user: userAddress ? userAddress.toLowerCase() : '',
      networkId: networkIdMock, // TODO: Replace with the actual network ID you want to query
    },
    skip: !userAddress,
  })

  return {
    // TODO:  Use this in consumers instead of relying in the order of the chain array
    chainId: GqlChain.Mainnet,
    data: data || { votingEscrowLocks: [] }, // TODO: simplify return shape (we don't need data here)
    isLoading: loading,
    error,
    refetch,
  }
}
