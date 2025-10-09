import { useQuery } from '@apollo/client'
import { GetVeBalTotalSupplyDocument, GqlChain } from '../services/api/generated/graphql'
import { secondsToMilliseconds } from 'date-fns'

export function useApiHealth() {
  const { error } = useQuery(GetVeBalTotalSupplyDocument, {
    variables: {
      chain: GqlChain.Mainnet,
    },
    initialFetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    pollInterval: secondsToMilliseconds(15),
    notifyOnNetworkStatusChange: true,
  })

  return {
    apiOK: error === undefined,
  }
}
