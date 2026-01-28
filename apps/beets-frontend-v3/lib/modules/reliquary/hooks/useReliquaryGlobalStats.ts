import { useQuery } from '@apollo/client/react'
import {
  GetReliquaryFarmSnapshotsDocument,
  GqlPoolSnapshotDataRange,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useReliquary } from '../ReliquaryProvider'

export function useReliquaryGlobalStats() {
  const { chain } = useReliquary()
  const networkConfig = getNetworkConfig(chain)

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
