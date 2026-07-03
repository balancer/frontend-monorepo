/**
 * Current pool state via helper-contract multicall (VaultExplorer +
 * ProtocolFeeController + pool-type getters).
 *
 * GET /api/pool/[chain]/[id]/state
 *   Returns a `PoolStateResponse` snapshot of the pool's current parameters.
 *   No DB persistence — drpc-only, cached at the edge.
 *
 * Dispatch:
 *   - `poolType` comes from api-v3 `poolGetPool`.
 *   - V3 + STABLE → universal (VaultExplorer + FeeController) + amp state.
 *   - V3 + other  → universal only (type-specific extras land in later phases).
 *   - V2         → not implemented in Phase B; returns universal: null.
 */

import 'server-only'
import { z } from 'zod'
import type { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'
import {
  readUniversalV3State,
  readStableTypeState,
  readV2BasePoolState,
  readV2StableTypeState,
} from '@analytics/lib/pool-state/read'
import { scrubError } from '@analytics/lib/drpc/scrub'
import type { PoolStateResponse } from '@analytics/lib/pool-events/types'

export const runtime = 'nodejs'
export const revalidate = 60

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

// Accept either a 42-char address (V3) or a 66-char V2/CowAmm poolId.
const PoolIdSchema = z
  .string()
  .regex(
    /^0x[a-fA-F0-9]{40}([a-fA-F0-9]{24})?$/,
    'pool must be a 0x-prefixed address (42 chars) or V2 poolId (66 chars)'
  )

const ChainSchema = z
  .string()
  .min(1)
  .transform((slug, ctx) => {
    try {
      return getChainSlug(slug.toLowerCase() as ChainSlug)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unknown chain slug: ${slug}` })
      return z.NEVER
    }
  })
  .refine(chain => (PROJECT_CONFIG.supportedNetworks as readonly GqlChain[]).includes(chain), {
    message: 'chain not in PROJECT_CONFIG.supportedNetworks',
  })
  .refine(chain => isDrpcSupportedChain(chain), {
    message: 'chain has no drpc endpoint configured',
  })

type RouteContext = { params: Promise<{ chain: string; id: string }> }

type PoolMeta = { type: string; protocolVersion: 1 | 2 | 3 } | null

async function fetchPoolMeta(chain: GqlChain, idOrAddress: string): Promise<PoolMeta> {
  // Try by id (V3 = 42 chars, V2 = 66 chars). When called with the 42-char
  // form for a V2 pool, this first query returns null and we fall back to
  // an address-keyed lookup.
  const idQuery = /* GraphQL */ `
    query StateMetaById($id: String!, $chain: GqlChain!) {
      poolGetPool(id: $id, chain: $chain) {
        type
        protocolVersion
      }
    }
  `
  const addrQuery = /* GraphQL */ `
    query StateMetaByAddress($address: String!, $chain: GqlChain!) {
      pools: poolGetPools(where: { addressIn: [$address], chainIn: [$chain] }, first: 1) {
        type
        protocolVersion
      }
    }
  `
  const idRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: idQuery, variables: { id: idOrAddress, chain } }),
    cache: 'no-store',
  })
  if (idRes.ok) {
    const json = (await idRes.json()) as {
      data?: { poolGetPool?: { type: string; protocolVersion: number } }
    }
    const p = json.data?.poolGetPool
    if (p) return { type: p.type, protocolVersion: p.protocolVersion as 1 | 2 | 3 }
  }
  if (idOrAddress.length !== 42) return null

  const addrRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: addrQuery,
      variables: { address: idOrAddress, chain },
    }),
    cache: 'no-store',
  })
  if (!addrRes.ok) return null
  const json = (await addrRes.json()) as {
    data?: { pools?: { type: string; protocolVersion: number }[] }
  }
  const p = json.data?.pools?.[0]
  if (!p) return null
  return { type: p.type, protocolVersion: p.protocolVersion as 1 | 2 | 3 }
}

export async function GET(_request: Request, ctx: RouteContext): Promise<Response> {
  const raw = await ctx.params
  const parsed = z.object({ chain: ChainSchema, id: PoolIdSchema }).safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { chain, id } = parsed.data
  const rawId = id.toLowerCase()
  // 20-byte contract address for the on-chain multicall.
  const pool = (rawId.length === 66 ? rawId.slice(0, 42) : rawId) as Address

  try {
    // Use the raw input for metadata lookup — `fetchPoolMeta` falls back to
    // address-keyed search if the 42-char form misses a V2 pool. `pool` is
    // always the 20-byte address for on-chain calls.
    const meta = await fetchPoolMeta(chain, rawId)
    let universal: PoolStateResponse['universal'] = null
    let typeSpecific: PoolStateResponse['typeSpecific'] = null

    const isStable = meta?.type === 'STABLE' || meta?.type === 'COMPOSABLE_STABLE'

    if (meta?.protocolVersion === 3) {
      // Universal state and (when applicable) amp state are independent
      // viem multicalls — neither needs the other's result. Running them
      // sequentially used to add the full amp-state read latency on top of
      // the universal one (~500ms each on cold drpc). With Promise.all the
      // wall-clock for a STABLE pool is now max(u, s) instead of u + s.
      const [u, s] = await Promise.all([
        readUniversalV3State(chain, pool),
        isStable ? readStableTypeState(chain, pool) : Promise.resolve(null),
      ])
      if (u) {
        universal = {
          swapFeePercentage: u.swapFeePercentage,
          aggregateSwapFeePercentage: u.aggregateSwapFeePercentage,
          aggregateYieldFeePercentage: u.aggregateYieldFeePercentage,
          isPaused: u.isPaused,
          isInRecoveryMode: u.isInRecoveryMode,
        }
        if (isStable && s) {
          typeSpecific = {
            poolCreatorSwapFeePercentage: u.poolCreatorSwapFeePercentage,
            poolCreatorYieldFeePercentage: u.poolCreatorYieldFeePercentage,
            amplificationParameter: s.amplificationParameter,
            amplificationState: s.amplificationState,
          }
        }
      }
    } else if (meta?.protocolVersion === 2) {
      // Same parallelization rationale as the V3 branch — V2 stable pools
      // get a ~500ms win when amp state runs concurrently with the base
      // pool read.
      const [v2, s] = await Promise.all([
        readV2BasePoolState(chain, pool),
        isStable ? readV2StableTypeState(chain, pool) : Promise.resolve(null),
      ])
      if (v2) {
        universal = {
          swapFeePercentage: v2.swapFeePercentage,
          // V2 has no aggregate fee concept — surface the same field names
          // so a single client can render the universal block uniformly,
          // with the protocol fee cache standing in for the protocol portion.
          aggregateSwapFeePercentage: v2.protocolSwapFeeCache,
          aggregateYieldFeePercentage: v2.protocolYieldFeeCache,
          isPaused: v2.isPaused,
          isInRecoveryMode: v2.isInRecoveryMode ?? false,
        }
        if (isStable && s) {
          typeSpecific = {
            poolCreatorSwapFeePercentage: null,
            poolCreatorYieldFeePercentage: null,
            amplificationParameter: s.amplificationParameter,
            amplificationState: s.amplificationState,
          }
        }
      }
    }

    const payload: PoolStateResponse = {
      pool: pool,
      chain,
      poolType: meta?.type ?? null,
      protocolVersion: meta?.protocolVersion ?? null,
      universal,
      typeSpecific,
      fetchedAt: Math.floor(Date.now() / 1000),
    }

    return Response.json(payload, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    console.error('[pool/state] read failed', { chain, id, ...scrubError(err) })
    return Response.json(
      { error: 'pool state read failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
