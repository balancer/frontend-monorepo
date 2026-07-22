/**
 * Historical token USD prices — day-bucketed, server-cached.
 *
 * GET /api/token-prices?chain=MONAD&addresses=0xabc,0xdef&range=90d
 *
 * Backs the pool page's LP-vs-HODL overlay (`useHodlComparison`). Exists so
 * the client never hits api-v3's `tokenGetHistoricalPrices` directly: that
 * query fired once per pool visit *and* again on every range toggle, from
 * every browser, uncached — which tripped api-v3's per-IP rate limit (429s).
 *
 * Routing through here gives the same protection the app's other client
 * hooks get: one server-side fetch feeds the Next Data Cache, so repeat
 * views and shared tokens (every USDC-holding pool asks for the same series)
 * dedupe onto a single upstream call. We also collapse the ~hourly upstream
 * series to one point per UTC-day here, cutting the payload ~24× before it
 * reaches the client (the overlay aligns to daily snapshots anyway).
 */

import 'server-only'
import { z } from 'zod'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { UpstreamError, gqlFetch, upstreamErrorToResponse } from '@analytics/lib/upstream/gql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

const DAY = 86400
const dayStart = (tsSeconds: number): number => Math.floor(tsSeconds / DAY) * DAY

// Same range vocabulary the page uses → api-v3's token-chart enum (distinct
// from the pool-snapshot enum: `NINETY_DAY` not `NINETY_DAYS`, `ALL` not
// `ALL_TIME`). Centralized here so the client just forwards its range string.
const RANGE_VALUES = ['30d', '90d', '180d', '1y', 'all'] as const
type HistoryRange = (typeof RANGE_VALUES)[number]

const TOKEN_RANGE: Record<HistoryRange, string> = {
  '30d': 'THIRTY_DAY',
  '90d': 'NINETY_DAY',
  '180d': 'ONE_HUNDRED_EIGHTY_DAY',
  '1y': 'ONE_YEAR',
  all: 'ALL',
}

/** Cap the address count so a crafted query can't fan out an unbounded
 *  upstream request. A boosted pool tops out at a handful of tokens ×2
 *  (wrapped + underlying); 24 is comfortably above any real pool. */
const MAX_ADDRESSES = 24

const ChainSchema = z.string().transform((v, ctx): GqlChain => {
  const chain = v as GqlChain
  if (!(PROJECT_CONFIG.supportedNetworks as readonly GqlChain[]).includes(chain)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unsupported chain: ${v}` })
    return z.NEVER
  }
  return chain
})

const AddressesSchema = z
  .string()
  .min(1)
  .transform((raw, ctx): string[] => {
    const parts = Array.from(
      new Set(
        raw
          .split(',')
          .map(a => a.trim().toLowerCase())
          .filter(Boolean)
      )
    )
    if (parts.length === 0 || parts.length > MAX_ADDRESSES) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `1–${MAX_ADDRESSES} addresses` })
      return z.NEVER
    }
    if (parts.some(a => !/^0x[a-f0-9]{40}$/.test(a))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'addresses must be 0x-prefixed 20-byte',
      })
      return z.NEVER
    }
    return parts
  })

const RangeSchema = z
  .string()
  .optional()
  .transform(
    (raw): HistoryRange =>
      raw && (RANGE_VALUES as readonly string[]).includes(raw) ? (raw as HistoryRange) : '90d'
  )

const QUERY = /* GraphQL */ `
  query AnalyticsHodlPrices(
    $addresses: [String!]!
    $chain: GqlChain!
    $range: GqlTokenChartDataRange!
  ) {
    tokenGetHistoricalPrices(addresses: $addresses, chain: $chain, range: $range) {
      address
      prices {
        price
        timestamp
      }
    }
  }
`

type UpstreamRes = {
  tokenGetHistoricalPrices?: Array<{
    address: string
    prices: Array<{ price: number; timestamp: string }>
  }>
}

export type HodlPricesResponse = {
  /** Per-token daily series: `[dayStartUnix, usdPrice]`, ascending. */
  series: Array<{ address: string; daily: Array<[number, number]> }>
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const parsed = z
    .object({ chain: ChainSchema, addresses: AddressesSchema, range: RangeSchema })
    .safeParse({
      chain: params.get('chain') ?? '',
      addresses: params.get('addresses') ?? '',
      range: params.get('range') ?? undefined,
    })
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  const { chain, addresses, range } = parsed.data

  try {
    const data = await gqlFetch<UpstreamRes>(
      API_URL,
      QUERY,
      { addresses, chain, range: TOKEN_RANGE[range] },
      {
        upstream: 'api-v3',
        label: 'tokenGetHistoricalPrices (hodl)',
        // Historical prices are ~hourly and day-bucketed here, so every
        // bucket except today's is frozen by construction. A short TTL
        // re-pulled an entire 90d/1y series just to move one trailing
        // point — and since `range` is part of the key, a user toggling
        // 30d→90d→1y→all paid four full upstream fetches. An hour keeps
        // the overlay's day-resolution honest at ~12× fewer upstream hits.
        cache: { revalidate: 3600 },
      }
    )

    const series = (data?.tokenGetHistoricalPrices ?? []).map(t => {
      // api-v3 returns prices ascending, so the last write per day wins.
      const daily = new Map<number, number>()
      for (const p of t.prices) {
        const ts = Number(p.timestamp)
        if (!Number.isFinite(ts) || !Number.isFinite(p.price)) continue
        daily.set(dayStart(ts), p.price)
      }
      const sorted = [...daily.entries()].sort((a, b) => a[0] - b[0]) as Array<[number, number]>
      return { address: t.address.toLowerCase(), daily: sorted }
    })

    const payload: HodlPricesResponse = { series }
    return Response.json(payload, {
      headers: {
        // Mirror the server revalidate for any shared/browser cache in front.
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    if (err instanceof UpstreamError) {
      const { status, body, headers } = upstreamErrorToResponse(err)
      return Response.json(body, { status, headers })
    }
    console.error('[token-prices] failed', { chain, range, count: addresses.length })
    return Response.json(
      { error: 'token prices fetch failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
