import { useQuery } from '@apollo/client'
import { GetProtocolStatsDocument } from '@repo/api/graphql'
import { supportedNetworks } from '@/lib/modules/web3/ChainConfig'

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
