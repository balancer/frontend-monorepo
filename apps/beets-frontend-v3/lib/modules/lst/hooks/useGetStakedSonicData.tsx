import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client/react'
import { minutesToMilliseconds } from 'date-fns'

export function useGetStakedSonicData() {
  return useQuery(GetStakedSonicDataDocument, {
    pollInterval: minutesToMilliseconds(5),
  })
}
