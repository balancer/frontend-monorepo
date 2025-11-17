import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { useHasApprovedRelayerForAllRelics } from '../hooks/useHasApprovedRelayerForAllRelics'

export function useBatchRelayerHasApprovedForAll() {
  const config = useNetworkConfig()
  const query = useHasApprovedRelayerForAllRelics(config.chainId)

  return {
    data: query.hasApprovedRelayerForAllRelics,
    refetch: query.refetch,
  }
}
