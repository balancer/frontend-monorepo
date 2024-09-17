import {
  GqlChain,
  GetPoolEventsDocument,
  GqlPoolEventType,
  GqlPoolEventsDataRange,
  GetPoolEventsQuery,
} from '@/lib/shared/services/api/generated/graphql'
import { FetchPolicy } from '@apollo/client'
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr'

type PoolEventList = GetPoolEventsQuery['poolEvents']
export type PoolEventItem = PoolEventList[0]

type PoolEventsProps = {
  poolIdIn?: string[]
  chainIn?: GqlChain[]
  first?: number
  skip?: number
  range?: GqlPoolEventsDataRange
  typeIn?: GqlPoolEventType[]
  userAddress?: string
}

export function usePoolEvents(
  { poolIdIn, chainIn, first, skip, range, typeIn, userAddress }: PoolEventsProps,
  opts: { skip?: boolean; fetchPolicy?: FetchPolicy } = {}
) {
  const poolIds = (poolIdIn || []).map(id => id.toLowerCase())

  return useQuery(GetPoolEventsDocument, {
    variables: {
      poolIdIn: poolIds,
      chainIn: chainIn || [],
      first,
      skip,
      range,
      typeIn,
      userAddress,
    },
    ...opts,
  })
}
