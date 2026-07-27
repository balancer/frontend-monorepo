'use client'

import { useMemo } from 'react'
import { GqlPoolAprItemTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { useQuery } from '@apollo/client/react'
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetProtocolStatsDocument,
  GqlChain,
  GqlPoolStakingType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type PortfolioPool = GetPoolsQuery['pools'][number]

export type RewardBucket = 'fees' | 'yield' | 'staking' | 'other'

export type AprBreakdownItem = {
  id: string
  title: string
  type: string | null
  apr: number
  rewardTokenSymbol: string | null
  rewardTokenAddress: string | null
  bucket: RewardBucket
}

export type PortfolioPosition = {
  pool: PortfolioPool
  chain: GqlChain
  /** Total user value in pool (wallet + staked), USD. */
  positionUsd: number
  walletUsd: number
  stakedUsd: number
  /** User's share of the pool, 0..1. Used to scale token composition. */
  shareOfPool: number
  /** Aggregated APR for the position (decimal). */
  totalApr: number
  feeApr: number
  yieldApr: number
  rewardApr: number
  dailyFeesUsd: number
  dailyYieldUsd: number
  dailyRewardsUsd: number
  aprBreakdown: AprBreakdownItem[]
  stakingType: GqlPoolStakingType | null
}

export type TokenAggregate = {
  address: string
  /** Chain the token lives on. Required for unique identity — the same
   *  symbol (USDC, USDp, etc.) exists on multiple chains. */
  chain: GqlChain
  symbol: string
  logoURI: string | null
  /** USD value attributable to this token across all positions. */
  valueUsd: number
  /** Underlying token balance (sum across positions, in token decimals). */
  balance: number
  /** Per-pool contributions for tooltip / drill-down. */
  contributions: { poolId: string; poolName: string; valueUsd: number; balance: number }[]
}

export type ChainAggregate = {
  chain: GqlChain
  positionUsd: number
  count: number
}

export type PortfolioSummary = {
  positionsCount: number
  totalUsd: number
  walletUsd: number
  stakedUsd: number
  dailyFeesUsd: number
  dailyYieldUsd: number
  dailyRewardsUsd: number
  /** Sum of fees + yield + rewards. The "all in" daily yield. */
  dailyEarningsUsd: number
  /** dailyEarningsUsd * 365 / totalUsd; 0 if no position. */
  blendedApr: number
  /** position USD / protocol TVL; 0 if either is unknown. */
  shareOfProtocolTvl: number
  protocolTvl: number
}

export type UsePortfolioByAddressResult = {
  loading: boolean
  error?: Error
  /** Lower-cased, validated address used for the query. */
  address: string | null
  /** Positions with a non-zero USD balance, sorted by position size desc. */
  positions: PortfolioPosition[]
  tokens: TokenAggregate[]
  chains: ChainAggregate[]
  summary: PortfolioSummary
}

/** APR types that represent realised swap fees for LPs. */
const FEE_TYPES: ReadonlySet<string> = new Set<string>([
  GqlPoolAprItemTypeValues.DynamicSwapFee24h,
  GqlPoolAprItemTypeValues.SwapFee,
  GqlPoolAprItemTypeValues.SwapFee24h,
  GqlPoolAprItemTypeValues.SwapFee7d,
  GqlPoolAprItemTypeValues.SwapFee30d,
])

/** APR types that represent rate-provider / interest-bearing token yield. */
const YIELD_TYPES: ReadonlySet<string> = new Set<string>([
  GqlPoolAprItemTypeValues.IbYield,
  GqlPoolAprItemTypeValues.QuantAmmUplift,
  GqlPoolAprItemTypeValues.Surplus,
  GqlPoolAprItemTypeValues.Surplus24h,
  GqlPoolAprItemTypeValues.Surplus7d,
  GqlPoolAprItemTypeValues.Surplus30d,
])

/** APR types that represent reward emissions (need a staked position). */
const STAKING_TYPES: ReadonlySet<string> = new Set<string>([
  GqlPoolAprItemTypeValues.Aura,
  GqlPoolAprItemTypeValues.Staking,
  GqlPoolAprItemTypeValues.StakingBoost,
  GqlPoolAprItemTypeValues.MaBeetsEmissions,
  GqlPoolAprItemTypeValues.Locking,
  GqlPoolAprItemTypeValues.VeBalEmissions,
  GqlPoolAprItemTypeValues.Voting,
  GqlPoolAprItemTypeValues.Merkl,
  GqlPoolAprItemTypeValues.Fuul,
])

function bucketize(type: string | null | undefined, title: string | undefined): RewardBucket {
  if (!type) {
    // Fallback by title — older API rows sometimes lack a type but have a
    // descriptive title (eg "Swap fees", "BAL reward").
    if (/swap fee|fee apr/i.test(title ?? '')) return 'fees'
    if (/yield|interest|surplus/i.test(title ?? '')) return 'yield'
    if (/reward|emission|aura|bal/i.test(title ?? '')) return 'staking'
    return 'other'
  }
  if (FEE_TYPES.has(type) || /SWAP_FEE/i.test(type)) return 'fees'
  if (YIELD_TYPES.has(type) || /YIELD|SURPLUS|UPLIFT/i.test(type)) return 'yield'
  if (STAKING_TYPES.has(type)) return 'staking'
  return 'other'
}

/**
 * Read the user's effective position USD from the API's `userBalance` block.
 * api-v3 already aggregates wallet + staked across staking variants, so we
 * just read what's there rather than recomputing.
 */
function readPosition(pool: PortfolioPool): {
  positionUsd: number
  walletUsd: number
  stakedUsd: number
  shareOfPool: number
  stakingType: GqlPoolStakingType | null
} {
  const ub = pool.userBalance
  const positionUsd = Number(ub?.totalBalanceUsd ?? 0)
  const walletUsd = Number(ub?.walletBalanceUsd ?? 0)
  const stakedUsd = Math.max(0, positionUsd - walletUsd)
  const tvl = Number(pool.dynamicData.totalLiquidity ?? 0)
  const shareOfPool = tvl > 0 ? positionUsd / tvl : 0
  // Pick the staked balance with the largest USD value to surface a single
  // "primary" staking type for the row (gauge / aura / reliquary / vebal).
  const stakingType =
    (ub?.stakedBalances ?? [])
      .filter(b => Number(b.balanceUsd ?? 0) > 0)
      .sort((a, b) => Number(b.balanceUsd ?? 0) - Number(a.balanceUsd ?? 0))[0]?.stakingType ?? null
  return { positionUsd, walletUsd, stakedUsd, shareOfPool, stakingType }
}

function buildPosition(pool: PortfolioPool): PortfolioPosition | null {
  const { positionUsd, walletUsd, stakedUsd, shareOfPool, stakingType } = readPosition(pool)
  // Filter out zero-balance pools (api-v3 sometimes returns them for users
  // who claimed/withdrew but still have a row).
  if (positionUsd <= 0) return null

  const aprItems = pool.dynamicData.aprItems ?? []
  const aprBreakdown: AprBreakdownItem[] = aprItems.map(item => ({
    id: item.id,
    title: item.title,
    type: item.type,
    apr: Number(item.apr ?? 0),
    rewardTokenSymbol: item.rewardTokenSymbol ?? null,
    rewardTokenAddress: item.rewardTokenAddress ?? null,
    bucket: bucketize(item.type ?? null, item.title),
  }))

  let feeApr = 0
  let yieldApr = 0
  let rewardApr = 0
  for (const item of aprBreakdown) {
    if (item.bucket === 'fees') feeApr += item.apr
    else if (item.bucket === 'yield') yieldApr += item.apr
    else if (item.bucket === 'staking') rewardApr += item.apr
  }
  const totalApr = feeApr + yieldApr + rewardApr

  // Daily $ — fees + yield apply to the whole position; staking rewards only
  // accrue on the *staked* slice.
  const dailyFeesUsd = (feeApr * positionUsd) / 365
  const dailyYieldUsd = (yieldApr * positionUsd) / 365
  const dailyRewardsUsd = (rewardApr * stakedUsd) / 365

  return {
    pool,
    chain: pool.chain,
    positionUsd,
    walletUsd,
    stakedUsd,
    shareOfPool,
    totalApr,
    feeApr,
    yieldApr,
    rewardApr,
    dailyFeesUsd,
    dailyYieldUsd,
    dailyRewardsUsd,
    aprBreakdown,
    stakingType,
  }
}

/**
 * Roll the position list up into the headline aggregates the dashboard
 * shows. Keeps every loop O(positions) so the entire derived tree is one
 * useMemo pass over the raw query result.
 */
function aggregate(
  positions: PortfolioPosition[],
  protocolTvl: number
): {
  tokens: TokenAggregate[]
  chains: ChainAggregate[]
  summary: PortfolioSummary
} {
  const tokenMap = new Map<string, TokenAggregate>()
  const chainMap = new Map<GqlChain, ChainAggregate>()

  let totalUsd = 0
  let walletUsd = 0
  let stakedUsd = 0
  let dailyFeesUsd = 0
  let dailyYieldUsd = 0
  let dailyRewardsUsd = 0

  for (const pos of positions) {
    totalUsd += pos.positionUsd
    walletUsd += pos.walletUsd
    stakedUsd += pos.stakedUsd
    dailyFeesUsd += pos.dailyFeesUsd
    dailyYieldUsd += pos.dailyYieldUsd
    dailyRewardsUsd += pos.dailyRewardsUsd

    const chainBucket = chainMap.get(pos.chain) ?? {
      chain: pos.chain,
      positionUsd: 0,
      count: 0,
    }
    chainBucket.positionUsd += pos.positionUsd
    chainBucket.count += 1
    chainMap.set(pos.chain, chainBucket)

    const tokens = pos.pool.poolTokens ?? []
    for (const t of tokens) {
      // Skip nested BPTs that don't represent a real underlying — they
      // double-count value that already flows through the nested pool.
      // We keep them in the per-pool table but exclude from composition.
      const balance = Number(t.balance ?? 0)
      const balanceUsd = Number(t.balanceUSD ?? 0)
      if (balance <= 0 || balanceUsd <= 0) continue
      const userBalance = balance * pos.shareOfPool
      const userValue = balanceUsd * pos.shareOfPool
      if (userValue <= 0) continue
      // Key by chain + address so the same symbol on two chains stays
      // distinct (USDC on Ethereum vs Base).
      const key = `${pos.chain}:${t.address.toLowerCase()}`
      const existing = tokenMap.get(key) ?? {
        address: t.address,
        chain: pos.chain,
        symbol: t.symbol,
        logoURI: t.logoURI ?? null,
        valueUsd: 0,
        balance: 0,
        contributions: [],
      }
      existing.valueUsd += userValue
      existing.balance += userBalance
      existing.contributions.push({
        poolId: pos.pool.id,
        poolName: pos.pool.name,
        valueUsd: userValue,
        balance: userBalance,
      })
      tokenMap.set(key, existing)
    }
  }

  const dailyEarningsUsd = dailyFeesUsd + dailyYieldUsd + dailyRewardsUsd
  const blendedApr = totalUsd > 0 ? (dailyEarningsUsd * 365) / totalUsd : 0
  const shareOfProtocolTvl = totalUsd > 0 && protocolTvl > 0 ? totalUsd / protocolTvl : 0

  return {
    tokens: Array.from(tokenMap.values()).sort((a, b) => b.valueUsd - a.valueUsd),
    chains: Array.from(chainMap.values()).sort((a, b) => b.positionUsd - a.positionUsd),
    summary: {
      positionsCount: positions.length,
      totalUsd,
      walletUsd,
      stakedUsd,
      dailyFeesUsd,
      dailyYieldUsd,
      dailyRewardsUsd,
      dailyEarningsUsd,
      blendedApr,
      shareOfProtocolTvl,
      protocolTvl,
    },
  }
}

const EMPTY_SUMMARY: PortfolioSummary = {
  positionsCount: 0,
  totalUsd: 0,
  walletUsd: 0,
  stakedUsd: 0,
  dailyFeesUsd: 0,
  dailyYieldUsd: 0,
  dailyRewardsUsd: 0,
  dailyEarningsUsd: 0,
  blendedApr: 0,
  shareOfProtocolTvl: 0,
  protocolTvl: 0,
}

export function usePortfolioByAddress(rawAddress: string | null): UsePortfolioByAddressResult {
  // Normalise — api-v3 lower-cases userAddress filters, so we do the same to
  // keep the Apollo cache key stable across pasted vs checksummed addresses.
  const address =
    rawAddress && /^0x[a-fA-F0-9]{40}$/.test(rawAddress) ? rawAddress.toLowerCase() : null
  const chainIn = PROJECT_CONFIG.supportedNetworks

  const poolsQuery = useQuery(GetPoolsDocument, {
    variables: {
      where: {
        userAddress: address,
        chainIn,
      },
    },
    skip: !address,
    // `no-cache` would make hard refreshes painfully slow; api-v3's
    // user-balance endpoint is fast enough that the default `cache-first`
    // plus the Apollo persistKey gives us instant re-renders on revisit.
  })

  const statsQuery = useQuery(GetProtocolStatsDocument, {
    variables: { chains: chainIn },
  })

  const protocolTvl = Number(statsQuery.data?.protocolMetricsAggregated?.totalLiquidity ?? 0)

  const derived = useMemo(() => {
    if (!address) {
      return {
        positions: [],
        tokens: [],
        chains: [],
        summary: { ...EMPTY_SUMMARY, protocolTvl },
      }
    }
    const positions = (poolsQuery.data?.pools ?? [])
      .map(buildPosition)
      .filter((p): p is PortfolioPosition => p !== null)
      .sort((a, b) => b.positionUsd - a.positionUsd)
    return { positions, ...aggregate(positions, protocolTvl) }
  }, [poolsQuery.data, protocolTvl, address])

  return {
    loading: poolsQuery.loading,
    error: poolsQuery.error as Error | undefined,
    address,
    positions: derived.positions,
    tokens: derived.tokens,
    chains: derived.chains,
    summary: derived.summary,
  }
}
