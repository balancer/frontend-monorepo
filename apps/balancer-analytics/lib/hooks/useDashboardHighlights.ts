'use client'

import { useMemo } from 'react'
import { GqlPoolOrderByValues, GqlPoolOrderDirectionValues, GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { useQuery } from '@apollo/client/react'
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GqlChain,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { useChainProtocolStats } from './useChainProtocolStats'

type Pool = GetPoolsQuery['pools'][number]

export type ChainVolumeLeader = {
  chain: GqlChain
  volume24h: number
  /** Share of total 24h volume across all supported chains (0..1). */
  share: number
  /** Number of chains we aggregated across (for the sub line). */
  chainCount: number
}

export type PoolLeader = {
  pool: Pool
  /** USD fees in the last 24h. */
  fees24h: number
  /** Sum of all aprItems (matches the explorer's "Total APR"). */
  totalApr: number
  /** TVL in USD. */
  tvl: number
}

export type DashboardHighlights = {
  loading: boolean
  topVolumeChain: ChainVolumeLeader | null
  topFeePool: PoolLeader | null
  topAprPool: PoolLeader | null
}

/** TVL floor for the APR leader so dust pools with degenerate APRs don't win. */
const APR_MIN_TVL_USD = 1_000_000

function getTotalApr(pool: Pool): number {
  return (pool.dynamicData.aprItems ?? []).reduce((acc, i) => acc + Number(i.apr ?? 0), 0)
}

/**
 * Derives the three leaderboard cards rendered by ProtocolHighlights.
 *
 * Reuses queries already issued elsewhere on the page (same variables
 * → Apollo cache hit): `GetProtocolStatsPerChain` via useChainProtocolStats
 * (also feeds TvlByChainBars), and `GetPools` with the same TVL-desc / 500-row
 * shape PoolExplorer uses, so no extra network roundtrips on the dashboard.
 */
export function useDashboardHighlights(): DashboardHighlights {
  const { data: chainData, loading: chainsLoading } = useChainProtocolStats()

  const { data: poolsData, loading: poolsLoading } = useQuery(GetPoolsDocument, {
    variables: {
      first: 500,
      skip: 0,
      orderBy: GqlPoolOrderByValues.TotalLiquidity,
      orderDirection: GqlPoolOrderDirectionValues.Desc,
      where: {
        chainIn: PROJECT_CONFIG.supportedNetworks,
        tagNotIn: ['BLACK_LISTED'],
        poolTypeNotIn: [GqlPoolTypeValues.LiquidityBootstrapping],
      },
    },
    fetchPolicy: 'cache-first',
  })

  const topVolumeChain = useMemo<ChainVolumeLeader | null>(() => {
    if (!chainData.length) return null
    const totals = chainData
      .map(c => ({ chain: c.chain, volume24h: Number(c.swapVolume24h || 0) }))
      .filter(c => c.volume24h > 0)
    if (!totals.length) return null
    const total = totals.reduce((a, b) => a + b.volume24h, 0)
    const winner = totals.reduce((a, b) => (b.volume24h > a.volume24h ? b : a))
    return {
      chain: winner.chain,
      volume24h: winner.volume24h,
      share: total > 0 ? winner.volume24h / total : 0,
      chainCount: totals.length,
    }
  }, [chainData])

  const { topFeePool, topAprPool } = useMemo<{
    topFeePool: PoolLeader | null
    topAprPool: PoolLeader | null
  }>(() => {
    const pools = poolsData?.pools ?? []
    if (!pools.length) return { topFeePool: null, topAprPool: null }

    let feeLeader: PoolLeader | null = null
    let aprLeader: PoolLeader | null = null

    for (const pool of pools) {
      const fees24h = Number(pool.dynamicData.fees24h ?? 0)
      const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
      const totalApr = getTotalApr(pool)

      if (fees24h > 0 && (!feeLeader || fees24h > feeLeader.fees24h)) {
        feeLeader = { pool, fees24h, totalApr, tvl }
      }
      if (tvl >= APR_MIN_TVL_USD && totalApr > 0 && (!aprLeader || totalApr > aprLeader.totalApr)) {
        aprLeader = { pool, fees24h, totalApr, tvl }
      }
    }

    return { topFeePool: feeLeader, topAprPool: aprLeader }
  }, [poolsData?.pools])

  return {
    loading: chainsLoading || poolsLoading,
    topVolumeChain,
    topFeePool,
    topAprPool,
  }
}

export { APR_MIN_TVL_USD }
