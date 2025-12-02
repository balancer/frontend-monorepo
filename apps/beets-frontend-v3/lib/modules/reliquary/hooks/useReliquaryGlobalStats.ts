import { useQuery } from '@apollo/client'
import {
  GetReliquaryFarmSnapshotsDocument,
  GqlPoolSnapshotDataRange,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'

export function useReliquaryGlobalStats() {
  const networkConfig = useNetworkConfig()

  const farmId = networkConfig.reliquary?.fbeets.farmId

  const { data, loading, error, ...rest } = useQuery(GetReliquaryFarmSnapshotsDocument, {
    variables: {
      chain: networkConfig.chain,
      id: `${farmId}`,
      range: 'THIRTY_DAYS' as GqlPoolSnapshotDataRange,
    },
  })

  const latest =
    data && data.snapshots && data.snapshots.length > 0
      ? data.snapshots[data.snapshots.length - 1]
      : null

  return {
    ...rest,
    latest,
    data,
    loading,
    error,
  }
}
