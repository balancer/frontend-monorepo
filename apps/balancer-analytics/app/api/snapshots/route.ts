/**
 * Public read endpoint for the protocol snapshot series.
 *
 * Returns `ProtocolSnapshotSeries` (see `lib/snapshots/types.ts`) — the shape
 * `useProtocolSnapshots()` is coded against. One DB row per
 * `(ts, chain, protocol)`; we fold them back into one `ProtocolSnapshotPoint`
 * per timestamp:
 *   - `protocol = 'CORE'`, `chain = 'ALL'`            → top-level fields
 *   - `protocol = 'CORE'`, `chain = ...`              → `byChain[...]`
 *   - `protocol = 'V2' | 'V3' | 'COW_AMM'`, ALL/chain → `breakdowns[P]`
 *
 * `?days=N` bounds the window (default 90, max ~5y).
 *
 * `?granularity=daily|hourly` selects sampling cadence (default hourly). In
 * `daily` mode a `DISTINCT ON (chain, protocol, ts/86400)` picks the latest
 * row per UTC day per (chain, protocol). Defillama backfill rows are already
 * one-per-day so they pass through unchanged; the hourly cron writes get
 * collapsed ~24×. Long-range charts (30D / 90D / 1Y / ALL) don't need
 * intra-day fidelity, so daily mode is the right default there — payload,
 * network egress, and client-side parsing all drop proportionally.
 *
 * Cached `revalidate = 3600` (1 hour) to align with the hourly snapshot
 * cron. Reading more often than the writer produces never yields fresher
 * data — it only keeps Neon warm and burns compute units. Different
 * `granularity` values get independent cache entries, so daily-for-90D
 * and hourly-for-7D coexist.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  sql,
  AGGREGATE_KEY,
  PROTOCOL_CORE,
  PROTOCOL_V2,
  PROTOCOL_V3,
  PROTOCOL_COW_AMM,
} from '@analytics/lib/db'
import type {
  ChainSnapshotPoint,
  ProtocolBreakdown,
  ProtocolKey,
  ProtocolSnapshotPoint,
  ProtocolSnapshotSeries,
  SnapshotSource,
} from '@analytics/lib/snapshots/types'

export const runtime = 'nodejs'
// Match the hourly cron cadence — there's no fresher data between writes,
// so a tighter revalidate just keeps Neon warm for no benefit.
export const revalidate = 3600

const DEFAULT_DAYS = 90
const MAX_DAYS = 365 * 5
// Allowed `days` buckets. Incoming requests get snapped UP to the next
// bucket so the number of distinct (days, granularity) cache keys is bounded
// regardless of input — an attacker can't force unbounded Postgres reads by
// varying `?days=N`. Mirrors the values the in-app hook actually sends.
const ALLOWED_DAYS = [30, 90, 365, MAX_DAYS] as const
type AllowedDays = (typeof ALLOWED_DAYS)[number]
type Granularity = 'hourly' | 'daily' | 'weekly'

// Cap the sampling cadence by range so the folded payload stays under Next's
// 2MB `unstable_cache` entry limit. Over that limit the entry silently fails
// to store, so every request re-runs the Postgres query (defeating the
// bounded-key guard above) and ships multi-MB JSON to the browser. Sizes are
// measured against the *cache entry* (Next serializes the object, which runs
// ~10% larger than the minified HTTP body). Hourly balloons fast (90d ≈ 5.4MB,
// 1y ≈ 7MB, 5y ≈ 11MB) and even *daily* crosses 2MB from ~1y up (1y daily
// ≈ 2.1MB, 5y ≈ 5.9MB). The cap is lossless in practice: every chart
// downsamples ranges beyond 24H to daily (or coarser) on the client anyway,
// so it never consumes the finer cadence.
const HOURLY_MAX_DAYS = 30 // hourly only for short ranges (30d ≈ 1.8MB entry)
const DAILY_MAX_DAYS = 90 // daily up to 90d (≈ 0.45MB); longer → weekly (1y ≈ 0.3MB, 5y ≈ 0.77MB)

function effectiveGranularity(days: AllowedDays, requested: Granularity): Granularity {
  if (days > DAILY_MAX_DAYS) return 'weekly'
  if (days > HOURLY_MAX_DAYS) return 'daily'
  return requested
}

function snapDays(raw: string | null): AllowedDays {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_DAYS
  const rounded = Math.min(MAX_DAYS, Math.round(n))
  for (const b of ALLOWED_DAYS) if (rounded <= b) return b
  return MAX_DAYS
}

function parseGranularity(raw: string | null): Granularity {
  return raw === 'daily' ? 'daily' : 'hourly'
}

const PROTOCOL_TO_KEY: Record<string, ProtocolKey> = {
  [PROTOCOL_V2]: 'V2',
  [PROTOCOL_V3]: 'V3',
  [PROTOCOL_COW_AMM]: 'COW_AMM',
}

type DbRow = {
  ts: string
  chain: string
  protocol: string
  total_liquidity: string
  swap_volume_24h: string
  swap_fee_24h: string
  yield_capture_24h: string
  surplus_24h: string
  pool_count: number
  num_lps: number
  source: string
}

function chainMetrics(r: DbRow): ChainSnapshotPoint {
  return {
    totalLiquidity: Number.parseFloat(r.total_liquidity),
    swapVolume24h: Number.parseFloat(r.swap_volume_24h),
    swapFee24h: Number.parseFloat(r.swap_fee_24h),
    yieldCapture24h: Number.parseFloat(r.yield_capture_24h),
    surplus24h: Number.parseFloat(r.surplus_24h),
    poolCount: r.pool_count,
    numLiquidityProviders: r.num_lps,
  }
}

function emptyBreakdown(): ProtocolBreakdown {
  return {
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    byChain: {},
  }
}

function emptyPoint(ts: number): ProtocolSnapshotPoint {
  return {
    timestamp: ts,
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    numLiquidityProviders: 0,
    byChain: {},
  }
}

async function fetchRows(days: AllowedDays, granularity: Granularity): Promise<DbRow[]> {
  const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
  // Daily mode: DISTINCT ON returns one row per (chain, protocol, UTC day),
  // keeping the latest reading inside that day (ORDER BY ... ts DESC). The
  // kept `ts` differs across (chain, protocol) within a day — e.g. the
  // api-v3 cron writes CORE at top-of-hour while DefiLlama backfill writes
  // V2/V3 at UTC midnight — so we MUST re-key the output `ts` to the UTC
  // day start `(ts / 86400) * 86400`. Otherwise `foldRows` groups by the raw
  // ts and a single day splits into two points (CORE on one, V2/V3 on the
  // other) → duplicate bars/points per day. Normalizing collapses every
  // row of a day onto one timestamp so they fold into one complete point.
  if (granularity === 'daily') {
    return (await sql`
      SELECT (latest.ts / 86400) * 86400 AS ts, chain, protocol,
             total_liquidity, swap_volume_24h, swap_fee_24h,
             yield_capture_24h, surplus_24h, pool_count, num_lps, source
      FROM (
        SELECT DISTINCT ON (chain, protocol, ts / 86400)
               ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
               yield_capture_24h, surplus_24h, pool_count, num_lps, source
        FROM protocol_snapshots
        WHERE ts >= ${cutoff}
        ORDER BY chain, protocol, ts / 86400, ts DESC
      ) latest
      ORDER BY 1 ASC
    `) as DbRow[]
  }
  // Weekly mode: identical DISTINCT-ON collapse as daily, bucketed to the UTC
  // week (`ts / 604800`) and re-keyed to the week start. Used only for
  // multi-year ranges where even daily would exceed the 2MB cache limit
  // (5y daily ≈ 5.4MB → weekly ≈ 0.76MB). Charts render these as coarse bars,
  // which is what a multi-year view wants anyway.
  if (granularity === 'weekly') {
    return (await sql`
      SELECT (latest.ts / 604800) * 604800 AS ts, chain, protocol,
             total_liquidity, swap_volume_24h, swap_fee_24h,
             yield_capture_24h, surplus_24h, pool_count, num_lps, source
      FROM (
        SELECT DISTINCT ON (chain, protocol, ts / 604800)
               ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
               yield_capture_24h, surplus_24h, pool_count, num_lps, source
        FROM protocol_snapshots
        WHERE ts >= ${cutoff}
        ORDER BY chain, protocol, ts / 604800, ts DESC
      ) latest
      ORDER BY 1 ASC
    `) as DbRow[]
  }
  return (await sql`
    SELECT ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
           yield_capture_24h, surplus_24h, pool_count, num_lps, source
    FROM protocol_snapshots
    WHERE ts >= ${cutoff}
    ORDER BY ts ASC
  `) as DbRow[]
}

function foldRows(rows: DbRow[]): ProtocolSnapshotSeries {
  const byTs = new Map<number, ProtocolSnapshotPoint>()
  for (const r of rows) {
    const ts = Number(r.ts)
    let p = byTs.get(ts)
    if (!p) {
      p = emptyPoint(ts)
      byTs.set(ts, p)
    }
    const m = chainMetrics(r)
    if (r.protocol === PROTOCOL_CORE) {
      if (r.chain === AGGREGATE_KEY) {
        p.totalLiquidity = m.totalLiquidity
        p.swapVolume24h = m.swapVolume24h
        p.swapFee24h = m.swapFee24h
        p.yieldCapture24h = m.yieldCapture24h
        p.surplus24h = m.surplus24h
        p.poolCount = m.poolCount
        p.numLiquidityProviders = m.numLiquidityProviders
        p.source = r.source as SnapshotSource
      } else {
        ;(p.byChain as Record<string, ChainSnapshotPoint>)[r.chain as GqlChain] = m
      }
    } else {
      const key = PROTOCOL_TO_KEY[r.protocol]
      if (!key) continue
      if (!p.breakdowns) p.breakdowns = {}
      let b = p.breakdowns[key]
      if (!b) {
        b = emptyBreakdown()
        p.breakdowns[key] = b
      }
      if (r.chain === AGGREGATE_KEY) {
        b.totalLiquidity = m.totalLiquidity
        b.swapVolume24h = m.swapVolume24h
        b.swapFee24h = m.swapFee24h
        b.yieldCapture24h = m.yieldCapture24h
        b.surplus24h = m.surplus24h
        b.poolCount = m.poolCount
      } else {
        ;(b.byChain as Record<string, ChainSnapshotPoint>)[r.chain as GqlChain] = m
      }
    }
  }
  const points = Array.from(byTs.values())
  return { points, generatedAt: points.at(-1)?.timestamp ?? null }
}

// Cache the entire folded payload. Keyed on the validated (days, granularity)
// tuple so the only distinct keys ever generated are
// `4 buckets × 2 granularities = 8`, regardless of what the URL string
// contains. This is the cache-busting amplification fix — random or
// adversarial query strings hit the route handler but never run Postgres
// more than once per (days, granularity) per `revalidate` window.
const getSnapshotSeries = unstable_cache(
  async (days: AllowedDays, granularity: Granularity): Promise<ProtocolSnapshotSeries> => {
    const rows = await fetchRows(days, granularity)
    return foldRows(rows)
  },
  ['protocol-snapshots'],
  // 1-hour TTL matches the cron write cadence. Combined with the
  // `s-maxage=3600` Cache-Control below, the CDN serves between writes and
  // the function only re-fetches from Postgres once per (days, granularity)
  // per hour. With 8 possible (days, granularity) keys, that's a ceiling of
  // 8 DB reads per hour regardless of traffic — and `stale-while-revalidate`
  // means visitors never wait for that refresh.
  { revalidate: 3600, tags: ['protocol-snapshots'] }
)

export async function GET(req: Request) {
  const url = new URL(req.url)
  const days = snapDays(url.searchParams.get('days'))
  // Cap cadence by range so the cached payload stays under 2MB (see
  // `effectiveGranularity`), regardless of the requested granularity.
  const granularity = effectiveGranularity(days, parseGranularity(url.searchParams.get('granularity')))
  // Daily/weekly payloads are small and bounded, so cache them. Hourly is only
  // ever the 24H/7D window, which over-fetches 30d (≈2.9MB serialized) — over
  // Next's 2MB `unstable_cache` entry limit, where a set would throw "failed
  // to set data cache" and break the response pipe. Serve it straight from
  // Postgres instead; it's still shared-cached by the `s-maxage=3600` header
  // below and the client's module-level cache, so origin load stays bounded.
  const series =
    granularity === 'hourly'
      ? foldRows(await fetchRows(days, granularity))
      : await getSnapshotSeries(days, granularity)
  // Browser + CDN cache. `s-maxage=3600` lets the Vercel edge share-cache
  // the response across visitors for the full snapshot interval; without
  // it the CDN treats this as private and every visitor reaches the origin
  // function (which then either hits `unstable_cache` or falls through to
  // Postgres). `max-age=60` keeps the browser tab snappy on a re-render;
  // `stale-while-revalidate=86400` lets the next hour-old refresh happen
  // out of band so navigations never wait on Postgres.
  return Response.json(series, {
    headers: {
      'Cache-Control':
        'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
