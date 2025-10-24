import { useQuery } from '@apollo/client'
import {
  GetReliquaryFarmSnapshotsDocument,
  GqlPoolSnapshotDataRange,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'

export function useReliquaryGlobalStats() {
  const networkConfig = useNetworkConfig()

  const { data, ...rest } = useQuery(GetReliquaryFarmSnapshotsDocument, {
    variables: {
      id: `${networkConfig.reliquary?.fbeets.farmId}`,
      range: 'THIRTY_DAYS' as GqlPoolSnapshotDataRange,
    },
    skip: !networkConfig.reliquary?.fbeets.farmId,
  })

  const latest =
    data && data.snapshots && data.snapshots.length > 0
      ? data.snapshots[data.snapshots.length - 1]
      : null

  return {
    ...rest,
    latest,
    data,
  }
}
