import { GetStakedSonicDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'

export function useGetStakedSonicData() {
  return useQuery(GetStakedSonicDataDocument)
}
