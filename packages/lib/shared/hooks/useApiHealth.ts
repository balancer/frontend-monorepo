import { useQuery } from '@apollo/client/react'
import { GetVeBalTotalSupplyDocument, GqlChain } from '../services/api/generated/graphql'
import { secondsToMilliseconds } from 'date-fns'

export function useApiHealth() {
  const { error } = useQuery(GetVeBalTotalSupplyDocument, {
    variables: {
      chain: GqlChain.Mainnet,
    },
    pollInterval: secondsToMilliseconds(15),
  })

  return {
    apiOK: error === undefined,
  }
}
