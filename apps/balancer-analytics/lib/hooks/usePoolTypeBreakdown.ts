'use client'

import { useQuery } from '@apollo/client/react'
import {
  GetPoolsDocument,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useMemo } from 'react'

export type PoolBreakdownSlice = { name: string; tvl: number }

// Mirrors usePoolExplorer's query variables exactly so Apollo dedupes — the
// explorer's fetch warms this hook's cache and vice-versa.
const SHARED_QUERY_VARS = {
  first: 500,
  skip: 0,
  orderBy: GqlPoolOrderBy.TotalLiquidity,
  orderDirection: GqlPoolOrderDirection.Desc,
  where: {
    chainIn: PROJECT_CONFIG.supportedNetworks,
    tagNotIn: ['BLACK_LISTED'],
    poolTypeNotIn: [GqlPoolType.LiquidityBootstrapping],
  },
}

/**
 * TVL grouped by pool type, summed across the same 500-pool sample the
 * explorer uses. Long-tail dust outside the top 500 is ignored.
 */
export function usePoolTypeBreakdown(): { data: PoolBreakdownSlice[]; loading: boolean } {
  const { data, loading } = useQuery(GetPoolsDocument, { variables: SHARED_QUERY_VARS })

  const slices = useMemo<PoolBreakdownSlice[]>(() => {
    const buckets = new Map<string, number>()
    for (const p of data?.pools ?? []) {
      const tvl = Number(p.dynamicData?.totalLiquidity ?? 0)
      buckets.set(p.type, (buckets.get(p.type) ?? 0) + tvl)
    }
    return [...buckets.entries()]
      .map(([name, tvl]) => ({ name, tvl }))
      .sort((a, b) => b.tvl - a.tvl)
  }, [data])

  return { data: slices, loading }
}

const VERSION_LABEL: Record<number, string> = {
  1: 'CoW AMM',
  2: 'Balancer v2',
  3: 'Balancer v3',
}

/**
 * TVL grouped by protocolVersion (v3 dominance). protocolVersion 1 = CoW AMM,
 * 2 = Balancer v2, 3 = Balancer v3. Same 500-pool sample as the type breakdown.
 */
export function useVersionTvlBreakdown(): { data: PoolBreakdownSlice[]; loading: boolean } {
  const { data, loading } = useQuery(GetPoolsDocument, { variables: SHARED_QUERY_VARS })

  const slices = useMemo<PoolBreakdownSlice[]>(() => {
    const buckets = new Map<number, number>()
    for (const p of data?.pools ?? []) {
      const tvl = Number(p.dynamicData?.totalLiquidity ?? 0)
      buckets.set(p.protocolVersion, (buckets.get(p.protocolVersion) ?? 0) + tvl)
    }
    return [...buckets.entries()]
      .map(([version, tvl]) => ({
        name: VERSION_LABEL[version] ?? `v${version}`,
        tvl,
      }))
      .sort((a, b) => b.tvl - a.tvl)
  }, [data])

  return { data: slices, loading }
}
