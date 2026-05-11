'use client'

import { useQuery } from '@apollo/client/react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type BoostedPool = {
  id: string
  poolId: string
  name: string
  chain: GqlChain
  apr: number
}

type Args = { limit?: number }
type Result = { data: BoostedPool[]; count: number; loading: boolean }

/**
 * Top boosted pools by APR. Boosted pools wrap yield-bearing tokens
 * (Aave/Morpho), surfaced via the `BOOSTED` tag in api-v3.
 */
export function useBoostedPools({ limit = 4 }: Args = {}): Result {
  const { data, loading } = useQuery(GetPoolsDocument, {
    variables: {
      first: limit,
      skip: 0,
      orderBy: GqlPoolOrderBy.Apr,
      orderDirection: GqlPoolOrderDirection.Desc,
      where: {
        chainIn: PROJECT_CONFIG.supportedNetworks,
        tagIn: ['BOOSTED'],
      },
    },
  })

  const items: BoostedPool[] = (data?.pools ?? []).map(p => ({
    id: `${p.chain}-${p.id}`,
    poolId: p.id,
    name: p.symbol || p.name,
    chain: p.chain,
    apr: Number(p.dynamicData?.aprItems?.[0]?.apr ?? 0),
  }))

  return { data: items, count: data?.count ?? 0, loading }
}
