import { useQuery } from '@apollo/client'
import { GetProtocolStatsDocument } from '../services/api/generated/graphql'
import { supportedNetworks } from '@repo/lib/modules/web3/ChainConfig'

export function useProtocolStats() {
  const statQuery = useQuery(GetProtocolStatsDocument, {
    variables: {
      chains: supportedNetworks,
    },
  })

  return {
    statQuery,
  }
}
