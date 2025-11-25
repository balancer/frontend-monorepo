import { GetLoopsDataDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { minutesToMilliseconds } from 'date-fns'

export function useLoopsGetData() {
  return useQuery(GetLoopsDataDocument, {
    pollInterval: minutesToMilliseconds(5),
  })
}
