import { useQuery } from '@apollo/client'
import {
  GetReliquaryFarmSnapshotsDocument,
  GqlPoolSnapshotDataRange,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useState } from 'react'

export function useGetReliquaryFarmSnapshots() {
  const [range, setRange] = useState<GqlPoolSnapshotDataRange>(GqlPoolSnapshotDataRange.ThirtyDays)

  // TODO: pass headers or not?
  const query = useQuery(GetReliquaryFarmSnapshotsDocument, {
    variables: {
      id: '0',
      range,
    },
  })

  return {
    query,
    setRange,
  }
}
