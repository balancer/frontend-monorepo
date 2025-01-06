import { useQuery } from '@apollo/client'
import { GetProtocolStatsDocument } from '../services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function useProtocolStats() {
  const statQuery = useQuery(GetProtocolStatsDocument, {
    variables: {
      chains: PROJECT_CONFIG.supportedNetworks,
    },
  })

  return {
    statQuery,
  }
}
