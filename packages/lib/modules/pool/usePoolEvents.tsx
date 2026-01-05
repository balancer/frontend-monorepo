import {
  GqlChain,
  GetPoolEventsDocument,
  GqlPoolEventType,
  GetPoolEventsQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import { FetchPolicy } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

type PoolEventList = GetPoolEventsQuery['poolEvents']
export type PoolEventItem = PoolEventList[0]

type PoolEventsProps = {
  poolId?: string
  chainIn?: GqlChain[]
  first?: number
  skip?: number
  type?: GqlPoolEventType
  userAddress?: string
}

export function usePoolEvents(
  { poolId, chainIn, first, skip, type, userAddress }: PoolEventsProps,
  opts: { skip?: boolean; fetchPolicy?: FetchPolicy } = {}
) {
  return useQuery(GetPoolEventsDocument, {
    variables: {
      poolId: poolId?.toLowerCase(),
      chainIn: chainIn || [],
      first,
      skip,
      type,
      userAddress,
    },
    ...opts,
  })
}
