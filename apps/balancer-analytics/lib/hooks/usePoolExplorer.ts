'use client'

import { useMemo } from 'react'
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

export type ExplorerPool = GetPoolsQuery['pools'][number]

export type SortKey = 'TVL' | 'VOLUME' | 'FEES' | 'APR' | 'YIELD_DAY' | 'USAGE' | 'HOLDERS'
export type SortDir = 'asc' | 'desc'

export type ExplorerFilters = {
  search: string
  chains: GqlChain[]
  types: GqlPoolType[]
  /** null = any version; 1 = CoW AMM, 2 = v2, 3 = v3 */
  protocolVersion: number | null
  /** Empty array = any hook (no filter). Non-empty = pool must have one of these hook types. */
  hookTypes: string[]
  minTvl: number
}

export type ExplorerAggregates = {
  count: number
  tvl: number
  volume24h: number
  fees24h: number
  yield24h: number
}

// Sum of all aprItems — same convention as the reference explorer's "Total APR".
function getTotalApr(pool: ExplorerPool): number {
  return (pool.dynamicData.aprItems ?? []).reduce((acc, item) => acc + Number(item.apr ?? 0), 0)
}

// Yield-bearing APR: rate-provider / ERC4626 yield only (excludes swap fees, staking).
function getYieldApr(pool: ExplorerPool): number {
  return (pool.dynamicData.aprItems ?? [])
    .filter(item => /YIELD/i.test(String(item.type ?? '')))
    .reduce((acc, item) => acc + Number(item.apr ?? 0), 0)
}

function getYieldPerDay(pool: ExplorerPool): number {
  const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
  return (getYieldApr(pool) * tvl) / 365
}

function getUsage(pool: ExplorerPool): number {
  const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
  const vol = Number(pool.dynamicData.volume24h ?? 0)
  return tvl > 0 ? vol / tvl : 0
}

export type EnrichedPool = ExplorerPool & {
  _totalApr: number
  _yieldApr: number
  _yieldPerDay: number
  _usage: number
  _holders: number
  _hookType: string | null
}

function enrich(pool: ExplorerPool): EnrichedPool {
  return {
    ...pool,
    _totalApr: getTotalApr(pool),
    _yieldApr: getYieldApr(pool),
    _yieldPerDay: getYieldPerDay(pool),
    _usage: getUsage(pool),
    _holders: Number(pool.dynamicData.holdersCount ?? 0),
    _hookType: pool.hook?.type ?? null,
  }
}

function matchesSearch(pool: EnrichedPool, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase().trim()
  if (!needle) return true
  if (pool.name?.toLowerCase().includes(needle)) return true
  if (pool.symbol?.toLowerCase().includes(needle)) return true
  if (pool.address?.toLowerCase().includes(needle)) return true
  if (pool.id?.toLowerCase().includes(needle)) return true
  if (pool.type?.toLowerCase().includes(needle)) return true
  if (pool.chain?.toLowerCase().includes(needle)) return true
  if (pool._hookType?.toLowerCase().includes(needle)) return true
  if (pool.poolTokens?.some(t => t.symbol?.toLowerCase().includes(needle))) return true
  return false
}

function passesHookTypes(pool: EnrichedPool, hookTypes: string[]): boolean {
  if (hookTypes.length === 0) return true
  return !!pool._hookType && hookTypes.includes(pool._hookType)
}

function getSortValue(pool: EnrichedPool, key: SortKey): number {
  switch (key) {
    case 'TVL':
      return Number(pool.dynamicData.totalLiquidity ?? 0)
    case 'VOLUME':
      return Number(pool.dynamicData.volume24h ?? 0)
    case 'FEES':
      return Number(pool.dynamicData.fees24h ?? 0)
    case 'APR':
      return pool._totalApr
    case 'YIELD_DAY':
      return pool._yieldPerDay
    case 'USAGE':
      return pool._usage
    case 'HOLDERS':
      return pool._holders
  }
}

type Args = {
  filters: ExplorerFilters
  sortKey: SortKey
  sortDir: SortDir
  pageIndex: number
  pageSize: number
}

type Result = {
  loading: boolean
  error: Error | null
  totalCount: number
  filteredCount: number
  aggregates: ExplorerAggregates
  pageItems: EnrichedPool[]
  allFilteredSorted: EnrichedPool[] // for CSV export
  availableChains: GqlChain[]
  availableTypes: GqlPoolType[]
  availableHooks: string[]
}

// Single 500-row fetch, then everything happens in memory. Matches the
// reference explorer's "fetch wide, filter local" pattern — the api-v3 paged
// query can't express our composite filters (hook type, usage, yield/day) so
// pushing it to the server doesn't help.
export function usePoolExplorer({
  filters,
  sortKey,
  sortDir,
  pageIndex,
  pageSize,
}: Args): Result {
  const { data, loading, error } = useQuery(GetPoolsDocument, {
    variables: {
      first: 500,
      skip: 0,
      orderBy: GqlPoolOrderBy.TotalLiquidity,
      orderDirection: GqlPoolOrderDirection.Desc,
      // Mirrors frontend-v3's default exclusions:
      //  · BLACK_LISTED — Balancer's curated bad-data / scam pool list
      //    (sourced from github.com/balancer/metadata). Pools flagged for
      //    broken price oracles get added here; reporting an offender to
      //    the metadata repo is the right fix for false-TVL outliers.
      //  · LIQUIDITY_BOOTSTRAPPING — transient sale pools, not real liquidity.
      where: {
        chainIn: PROJECT_CONFIG.supportedNetworks,
        tagNotIn: ['BLACK_LISTED'],
        poolTypeNotIn: [GqlPoolType.LiquidityBootstrapping],
      },
    },
    fetchPolicy: 'cache-first',
  })

  const enriched = useMemo<EnrichedPool[]>(
    () => (data?.pools ?? []).map(enrich),
    [data?.pools]
  )

  const availableChains = useMemo<GqlChain[]>(() => {
    const set = new Set<GqlChain>()
    enriched.forEach(p => set.add(p.chain))
    return Array.from(set).sort()
  }, [enriched])

  const availableTypes = useMemo<GqlPoolType[]>(() => {
    const set = new Set<GqlPoolType>()
    enriched.forEach(p => set.add(p.type))
    return Array.from(set).sort()
  }, [enriched])

  const availableHooks = useMemo<string[]>(() => {
    const set = new Set<string>()
    enriched.forEach(p => p._hookType && set.add(p._hookType))
    return Array.from(set).sort()
  }, [enriched])

  const filtered = useMemo<EnrichedPool[]>(() => {
    const { search, chains, types, protocolVersion, hookTypes, minTvl } = filters
    return enriched.filter(p => {
      if (chains.length && !chains.includes(p.chain)) return false
      if (types.length && !types.includes(p.type)) return false
      if (protocolVersion !== null && p.protocolVersion !== protocolVersion) return false
      if (!passesHookTypes(p, hookTypes)) return false
      if (minTvl > 0 && Number(p.dynamicData.totalLiquidity ?? 0) < minTvl) return false
      if (!matchesSearch(p, search)) return false
      return true
    })
  }, [enriched, filters])

  const sorted = useMemo<EnrichedPool[]>(() => {
    const arr = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => (getSortValue(a, sortKey) - getSortValue(b, sortKey)) * dir)
    return arr
  }, [filtered, sortKey, sortDir])

  const aggregates = useMemo<ExplorerAggregates>(() => {
    return filtered.reduce<ExplorerAggregates>(
      (acc, p) => {
        acc.count += 1
        acc.tvl += Number(p.dynamicData.totalLiquidity ?? 0)
        acc.volume24h += Number(p.dynamicData.volume24h ?? 0)
        acc.fees24h += Number(p.dynamicData.fees24h ?? 0)
        acc.yield24h += p._yieldPerDay
        return acc
      },
      { count: 0, tvl: 0, volume24h: 0, fees24h: 0, yield24h: 0 }
    )
  }, [filtered])

  const pageItems = useMemo<EnrichedPool[]>(() => {
    const start = pageIndex * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, pageIndex, pageSize])

  return {
    loading,
    error: error ?? null,
    totalCount: enriched.length,
    filteredCount: filtered.length,
    aggregates,
    pageItems,
    allFilteredSorted: sorted,
    availableChains,
    availableTypes,
    availableHooks,
  }
}
