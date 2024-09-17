import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { GetProtocolStatsDocument } from '../services/api/generated/graphql'
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
