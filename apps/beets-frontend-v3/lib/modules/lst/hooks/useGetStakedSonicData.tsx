import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import minutesToMilliseconds from 'date-fns/minutesToMilliseconds'

export function useGetStakedSonicData() {
  return useQuery(GetStakedSonicDataDocument, {
    pollInterval: minutesToMilliseconds(5),
  })
}
