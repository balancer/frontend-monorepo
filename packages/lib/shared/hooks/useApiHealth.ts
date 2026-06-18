import { useQuery } from '@apollo/client/react'
import { GetVeBalTotalSupplyDocument } from '../services/api/generated/graphql'
import { GqlChainValues } from '../services/api/generated/graphql-enums'
import { secondsToMilliseconds } from 'date-fns'

export function useApiHealth() {
  const { error } = useQuery(GetVeBalTotalSupplyDocument, {
    variables: {
      chain: GqlChainValues.Mainnet,
    },
    pollInterval: secondsToMilliseconds(15),
  })

  return {
    apiOK: error === undefined,
  }
}
