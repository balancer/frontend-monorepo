import { useQuery } from '@apollo/client'
import { GetReliquaryFarmSnapshotsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useReliquary } from '../ReliquaryProvider'

export function useGetReliquaryFarmSnapshots() {
  const { range } = useReliquary()

  // TODO: pass headers or not?
  const query = useQuery(GetReliquaryFarmSnapshotsDocument, {
    variables: {
      id: '0',
      range,
    },
  })

  return {
    query,
  }
}
