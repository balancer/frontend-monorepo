/**
 * Pool param-event timeline (lazy-fetched on pool-page visit).
 *
 * GET  /api/pool/[chain]/[id]/events
 *   Triggers a tail-sync of the pool's parameter-change events from drpc,
 *   write-through into Postgres, and returns the full event timeline.
 *   Internally TTL-gated (30s) and in-flight-deduped per `(chain, pool)`.
 *
 * POST /api/pool/[chain]/[id]/events
 *   Forces a re-sync regardless of TTL. Intended for debug / data-correction.
 *   Same payload shape as GET.
 *
 * Phase A: returns the schema-correct empty payload after exercising the
 * full control flow (DB watermark, drpc head-block lookup). Phase B fills
 * in the event scan + decode + persist steps inside `syncPoolEvents`.
 */

import 'server-only'
import { z } from 'zod'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { ensureSchemaOnce } from '@analytics/lib/db'
import { isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'
import { syncPoolEvents } from '@analytics/lib/pool-events/sync'
import { scrubError } from '@analytics/lib/drpc/scrub'
import type { PoolEventsResponse } from '@analytics/lib/pool-events/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Accept either a 42-char address (V3) or a 66-char V2/CowAmm poolId.
// On-chain calls only need the 20-byte address portion, which we slice
// before forwarding to `syncPoolEvents`.
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

async function handle(
  request: Request,
  ctx: RouteContext,
  options: { force: boolean }
): Promise<Response> {
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
  const rawId = id.toLowerCase()
  // On-chain calls always use the 20-byte contract address. For V2 poolIds
  // (66 chars) we strip the trailing type+nonce bytes.
  const contractAddress = rawId.length === 66 ? rawId.slice(0, 42) : rawId
  // `?fullHistory` mirrors the page: scan from the deployment block instead
  // of the 90-day cap. Implies a cold rescan inside `syncPoolEvents`.
  const fullHistory = new URL(request.url).searchParams.has('fullHistory')

  try {
    await ensureSchemaOnce()
    const result = await syncPoolEvents(chain, contractAddress, {
      force: options.force,
      fullHistory,
      // For V2 / CowAmm pools the URL carries the 66-char poolId; pass it
      // through so `poolGetPool` resolves (the 20-byte contract address
      // would 404 against api-v3 and poison the watermark).
      apiV3Id: rawId,
    })
    const payload: PoolEventsResponse = {
      pool: contractAddress,
      chain,
      events: result.events,
      lastBlock: result.lastBlock,
      cached: result.cached,
    }
    return Response.json(payload, {
      headers: {
        'Cache-Control': options.force
          ? 'no-store'
          : 's-maxage=30, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    // Never surface raw error messages — they can leak the drpc URL with the
    // API key embedded. `scrubError` redacts the key before logging; the
    // client gets a plain sanitized message regardless.
    console.error('[pool/events] sync failed', { chain, id, ...scrubError(err) })
    return Response.json(
      { error: 'pool event sync failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function GET(request: Request, ctx: RouteContext): Promise<Response> {
  return handle(request, ctx, { force: false })
}

export async function POST(request: Request, ctx: RouteContext): Promise<Response> {
  return handle(request, ctx, { force: true })
}
