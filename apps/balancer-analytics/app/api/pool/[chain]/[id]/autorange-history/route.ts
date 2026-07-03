/**
 * AutoRange historical bounds — sampled per-snapshot via archive RPC.
 *
 * GET  /api/pool/[chain]/[id]/autorange-history?range=30d|90d|180d|1y|all
 *   Pulls snapshot timestamps from api-v3 for the requested range, samples
 *   the on-chain AutoRange state at the corresponding historical blocks
 *   (one archive multicall per snapshot), and returns the bounds + spot
 *   + centeredness series for the client chart.
 *
 * Cached as `s-maxage=60, stale-while-revalidate=600` — bounds move on
 * any interaction with the pool, but day-aged samples are stable, so a
 * 1-minute server cache is the right knob for view-heavy refresh cycles.
 */

import 'server-only'
import { z } from 'zod'
import type { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'
import { gqlFetch } from '@analytics/lib/upstream/gql'
import { scrubError } from '@analytics/lib/drpc/scrub'
import {
  readAutoRangeHistory,
  type AutoRangeHistoryPoint,
} from '@analytics/lib/pool-state/autorange-history'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

// Same range vocabulary the page uses; centralized here so the route's
// validator and downstream snapshot enum stay in lockstep.
const RANGE_VALUES = ['30d', '90d', '180d', '1y', 'all'] as const
type HistoryRange = (typeof RANGE_VALUES)[number]

const SNAPSHOT_RANGE: Record<HistoryRange, string> = {
  '30d': 'NINETY_DAYS', // trim to 30d client-side after the fetch
  '90d': 'NINETY_DAYS',
  '180d': 'ONE_HUNDRED_EIGHTY_DAYS',
  '1y': 'ONE_YEAR',
  all: 'ALL_TIME',
}

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

const RangeSchema = z
  .string()
  .optional()
  .transform((raw): HistoryRange => {
    if (raw && (RANGE_VALUES as readonly string[]).includes(raw)) return raw as HistoryRange
    return '90d'
  })

const SNAPSHOTS_QUERY = /* GraphQL */ `
  query AnalyticsAutoRangeSnapshots(
    $id: String!
    $chain: GqlChain!
    $range: GqlPoolSnapshotDataRange!
  ) {
    snapshots: poolGetSnapshots(id: $id, chain: $chain, range: $range) {
      timestamp
    }
  }
`

type SnapshotsRes = { snapshots: { timestamp: number }[] }

export type AutoRangeHistoryResponse = {
  pool: string
  chain: GqlChain
  range: HistoryRange
  samples: AutoRangeHistoryPoint[]
}

type RouteContext = { params: Promise<{ chain: string; id: string }> }

export async function GET(request: Request, ctx: RouteContext): Promise<Response> {
  const raw = await ctx.params
  const parsed = z
    .object({ chain: ChainSchema, id: PoolIdSchema })
    .safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { chain, id } = parsed.data
  const range = RangeSchema.parse(new URL(request.url).searchParams.get('range') ?? undefined)

  const rawId = id.toLowerCase()
  const contractAddress = rawId.length === 66 ? rawId.slice(0, 42) : rawId

  try {
    // api-v3 has the snapshot timestamps already — let it own pagination
    // and the time-window semantics so the route stays simple. We trim
    // the 30d view from the 90d enum the same way the page does.
    const snapshotsRes = await gqlFetch<SnapshotsRes>(
      API_URL,
      SNAPSHOTS_QUERY,
      { id: rawId, chain, range: SNAPSHOT_RANGE[range] },
      {
        upstream: 'api-v3',
        label: 'poolGetSnapshots (autorange-history)',
        cache: { revalidate: 60 },
      }
    )

    const allSnapshots = snapshotsRes?.snapshots ?? []
    let snapshotTimestamps = allSnapshots.map(s => Number(s.timestamp))

    if (range === '30d' && snapshotTimestamps.length > 0) {
      let latest = 0
      for (const ts of snapshotTimestamps) if (ts > latest) latest = ts
      const cutoff = latest - 30 * 86400
      snapshotTimestamps = snapshotTimestamps.filter(ts => ts >= cutoff)
    }

    const samples = await readAutoRangeHistory(
      chain,
      contractAddress as Address,
      snapshotTimestamps
    )

    const payload: AutoRangeHistoryResponse = {
      pool: contractAddress,
      chain,
      range,
      samples,
    }

    return Response.json(payload, {
      headers: {
        // Bounds change on every pool interaction, but snapshot-aged
        // samples are stable; a short server cache deduplicates the
        // archive fan-out for click-arounds without staling on a real
        // recenter event.
        'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    console.error('[pool/autorange-history] failed', { chain, id, ...scrubError(err) })
    return Response.json(
      { error: 'autorange history fetch failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
