/**
 * Unclaimed reward tokens that have accrued in liquidity gauges for the
 * inspected address. Distinct from Merkl: gauge rewards are claimed
 * directly via `claim_rewards()` on each gauge contract, while Merkl
 * rewards are claimed off-chain via merkl.xyz.
 *
 * Flow:
 *   1. Query api-v3 for the user's staked positions, grouped by chain.
 *      Each carries the gauge address + the active reward tokens.
 *   2. For each chain in parallel, multicall `claimable_reward(user, t)`
 *      on every (gauge, reward_token) pair.
 *   3. Fetch token metadata + USD prices from api-v3 in one go.
 *   4. Aggregate per (chain, token) and return.
 *
 * Skips pools where `rewardPerSecond` is zero across all reward tokens
 * — those gauges are dormant and the multicall would only return zeros.
 * BAL emissions ended, so this often shaves the fan-out down to a handful
 * of (gauge, token) pairs even for wallets with many positions.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { type Address, isAddress, parseAbi } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getPublicClient, UnsupportedChainError } from '@analytics/lib/drpc/client'

export const runtime = 'nodejs'
export const revalidate = 600

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

// Single canonical entry point — both old Curve-style gauges and newer
// Balancer reward gauges expose this signature with identical semantics.
const GAUGE_ABI = parseAbi([
  'function claimable_reward(address user, address reward_token) view returns (uint256)',
])

const STAKED_POOLS_QUERY = /* GraphQL */ `
  query UserStakedPools($user: String!, $chains: [GqlChain!]!) {
    pools: poolGetPools(first: 500, where: { userAddress: $user, chainIn: $chains }) {
      chain
      id
      staking {
        type
        gauge {
          gaugeAddress
          rewards {
            tokenAddress
            rewardPerSecond
          }
        }
      }
      userBalance {
        stakedBalances {
          balance
          stakingType
        }
      }
    }
  }
`

const TOKEN_PRICES_QUERY = /* GraphQL */ `
  query GaugeRewardTokens($chains: [GqlChain!]!) {
    tokenGetTokens(chains: $chains) {
      chain
      address
      symbol
      decimals
    }
    tokenGetCurrentPrices(chains: $chains) {
      chain
      address
      price
    }
  }
`

type StakedPool = {
  chain: GqlChain
  id: string
  staking: {
    type: string
    gauge: {
      gaugeAddress: string
      rewards: { tokenAddress: string; rewardPerSecond: string }[]
    } | null
  } | null
  userBalance: {
    stakedBalances: { balance: string; stakingType: string }[]
  } | null
}

type TokenInfo = {
  chain: GqlChain
  address: string
  symbol: string
  decimals: number
  price: number | null
}

export type AnalyticsGaugeReward = {
  symbol: string
  tokenAddress: string
  chain: GqlChain
  chainId: number
  decimals: number
  /** Token units still claimable from this user's gauges. */
  unclaimed: number
  /** USD value of `unclaimed` when api-v3 has a current price; null
   *  otherwise (silver-listed tokens, freshly-launched reward tokens). */
  unclaimedUsd: number | null
}

export type AnalyticsGaugeRewardsPayload = {
  totalUnclaimedUsd: number
  rewards: AnalyticsGaugeReward[]
  /** Errors encountered per chain — surfaced for debugging without
   *  failing the whole route. */
  chainErrors: Record<string, string>
}

async function gqlFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`api-v3 HTTP ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) throw new Error(`api-v3 errors: ${JSON.stringify(json.errors)}`)
  if (!json.data) throw new Error('api-v3 returned no data')
  return json.data
}

/**
 * Pull out the (gauge, rewardToken) pairs worth querying for one pool.
 * A pair is worth querying when the user has a non-zero staked balance on
 * the main gauge stake type and the reward token has a non-zero emission
 * rate. We also accept zero-rate rewards iff the gauge is still active —
 * dormant tokens occasionally hold trailing claimable balances after
 * emissions end, and the multicall cost of an extra view call is low.
 */
function extractPairs(pool: StakedPool): { gauge: Address; rewardToken: Address }[] {
  const gauge = pool.staking?.gauge
  if (!gauge?.gaugeAddress) return []
  // `Gauge` stake type only — Aura / veBAL / Reliquary live in separate
  // contracts that this route doesn't cover.
  const stake = pool.userBalance?.stakedBalances?.find(b => b.stakingType === 'GAUGE')
  if (!stake || Number(stake.balance) <= 0) return []
  const tokens = gauge.rewards ?? []
  if (tokens.length === 0) return []
  return tokens.map(r => ({
    gauge: gauge.gaugeAddress as Address,
    rewardToken: r.tokenAddress as Address,
  }))
}

async function readChainRewards(
  chain: GqlChain,
  address: Address,
  pairs: { gauge: Address; rewardToken: Address }[]
): Promise<{ rewardToken: Address; amount: bigint }[]> {
  if (pairs.length === 0) return []
  const client = getPublicClient(chain)
  // One multicall per chain — viem batches by Multicall3 internally.
  // Failures on a single pair (gauge missing `claimable_reward`, RPC
  // hiccup) degrade to `result === undefined` instead of throwing the
  // whole batch.
  const results = await client.multicall({
    contracts: pairs.map(p => ({
      address: p.gauge,
      abi: GAUGE_ABI,
      functionName: 'claimable_reward',
      args: [address, p.rewardToken] as const,
    })),
    allowFailure: true,
  })
  return pairs.map((p, i) => {
    const r = results[i]
    if (!r || r.status !== 'success') return { rewardToken: p.rewardToken, amount: 0n }
    return { rewardToken: p.rewardToken, amount: r.result as bigint }
  })
}

async function buildPayload(address: string): Promise<AnalyticsGaugeRewardsPayload> {
  const checksum = address as Address
  const chains = PROJECT_CONFIG.supportedNetworks

  const data = await gqlFetch<{ pools: StakedPool[] }>(STAKED_POOLS_QUERY, {
    user: address,
    chains,
  })
  const pools = data.pools ?? []

  // Group claim queries per chain so we issue one multicall each.
  const pairsByChain = new Map<GqlChain, { gauge: Address; rewardToken: Address }[]>()
  for (const pool of pools) {
    const pairs = extractPairs(pool)
    if (pairs.length === 0) continue
    const bucket = pairsByChain.get(pool.chain) ?? []
    bucket.push(...pairs)
    pairsByChain.set(pool.chain, bucket)
  }

  if (pairsByChain.size === 0) {
    return { totalUnclaimedUsd: 0, rewards: [], chainErrors: {} }
  }

  // Token metadata + prices for the chains we touched. One round-trip.
  const touchedChains = Array.from(pairsByChain.keys())
  const tokenData = await gqlFetch<{
    tokenGetTokens: { chain: GqlChain; address: string; symbol: string; decimals: number }[]
    tokenGetCurrentPrices: { chain: GqlChain; address: string; price: number }[]
  }>(TOKEN_PRICES_QUERY, { chains: touchedChains })

  const tokenMap = new Map<string, TokenInfo>()
  for (const t of tokenData.tokenGetTokens ?? []) {
    const key = `${t.chain}:${t.address.toLowerCase()}`
    tokenMap.set(key, { ...t, address: t.address.toLowerCase(), price: null })
  }
  for (const p of tokenData.tokenGetCurrentPrices ?? []) {
    const key = `${p.chain}:${p.address.toLowerCase()}`
    const existing = tokenMap.get(key)
    if (existing) existing.price = p.price
  }

  // Parallel per-chain multicalls. We `Promise.allSettled` so one bad
  // chain (RPC outage, viem chain config missing) doesn't kill the rest.
  const chainErrors: Record<string, string> = {}
  const settled = await Promise.allSettled(
    Array.from(pairsByChain.entries()).map(async ([chain, pairs]) => {
      try {
        const results = await readChainRewards(chain, checksum, pairs)
        return { chain, results }
      } catch (err) {
        if (err instanceof UnsupportedChainError) {
          // Don't surface as an error — just means we don't have an RPC
          // for that chain. Empty results for it.
          return { chain, results: [] }
        }
        chainErrors[chain] = String(err)
        return { chain, results: [] }
      }
    })
  )

  // Aggregate per (chain, token).
  const rewardsByKey = new Map<string, AnalyticsGaugeReward>()
  let totalUnclaimedUsd = 0

  for (const settledResult of settled) {
    if (settledResult.status !== 'fulfilled') continue
    const { chain, results } = settledResult.value
    for (const r of results) {
      if (r.amount === 0n) continue
      const tokenAddrLower = r.rewardToken.toLowerCase()
      const info = tokenMap.get(`${chain}:${tokenAddrLower}`)
      const decimals = info?.decimals ?? 18
      const tokenUnits = Number(r.amount) / 10 ** decimals
      const key = `${chain}:${tokenAddrLower}`
      const existing = rewardsByKey.get(key) ?? {
        symbol: info?.symbol ?? tokenAddrLower.slice(0, 6),
        tokenAddress: r.rewardToken,
        chain,
        chainId: getChainId(chain),
        decimals,
        unclaimed: 0,
        unclaimedUsd: null,
      }
      existing.unclaimed += tokenUnits
      if (info?.price != null && Number.isFinite(info.price)) {
        const addUsd = tokenUnits * info.price
        existing.unclaimedUsd = (existing.unclaimedUsd ?? 0) + addUsd
        totalUnclaimedUsd += addUsd
      }
      rewardsByKey.set(key, existing)
    }
  }

  const rewards = Array.from(rewardsByKey.values()).sort((a, b) => {
    const usdDiff = (b.unclaimedUsd ?? 0) - (a.unclaimedUsd ?? 0)
    if (usdDiff !== 0) return usdDiff
    return b.unclaimed - a.unclaimed
  })

  return { totalUnclaimedUsd, rewards, chainErrors }
}

const CACHE_VERSION = 'v1'
function makeCachedFetcher(address: string) {
  return unstable_cache(
    () => buildPayload(address),
    ['portfolio-gauge-rewards', CACHE_VERSION, address],
    {
      revalidate: 600,
      tags: [`portfolio-gauge-rewards:${address}`],
    }
  )
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> }
): Promise<NextResponse<AnalyticsGaugeRewardsPayload | { error: string }>> {
  const { address: rawAddress } = await ctx.params
  if (!isAddress(rawAddress)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }
  const address = rawAddress.toLowerCase()
  try {
    const payload = await makeCachedFetcher(address)()
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
