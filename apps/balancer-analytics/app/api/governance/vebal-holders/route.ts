/**
 * veBAL holder distribution from Dune query 3645067, cached for one week.
 *
 * The distribution barely moves — veBAL was decommissioned by BIP-921 and
 * no new locks can form, so the weekly refresh aligns with the slowest
 * meaningful change (expiring locks rolling off). The route caches in
 * two places:
 *   - Next.js `unstable_cache` keyed on `governance-vebal-holders` with
 *     `revalidate: 604_800` so the Dune call fires at most once per week
 *     per server, no matter how many hits the route gets.
 *   - CDN + browser via `Cache-Control: public, max-age=86400,
 *     stale-while-revalidate=604_800` — daily TTL with stale-allowed for
 *     the full week so a cold edge still serves something instantly.
 *
 * Errors don't poison the cache (the `catch` is outside `unstable_cache`),
 * so a transient Dune outage just falls back to whatever cached snapshot
 * the route last returned.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  fetchVeBalHoldersSnapshot,
  type VeBalHoldersSnapshot,
} from '@analytics/lib/dune/fetch-vebal-holders'

export const runtime = 'nodejs'
// 7 days — matches the upstream cache window for this Dune query.
export const revalidate = 604_800

export type VeBalHoldersPayload = {
  /** Snapshot day from Dune (`YYYY-MM-DD HH:MM:SS`). Empty string when
   *  no rows came back. */
  day: string
  /** Rows for the latest day, sorted by pct descending. */
  rows: VeBalHoldersSnapshot['rows']
  generatedAt: number
}

// Cache key bumped from `governance-vebal-holders` (v1, query 3645067) to
// `…-v2` after switching the upstream Dune query to 601405 — the row shape
// changed (added wallet_address), and the old cache would otherwise keep
// serving stale rows for the full week.
const getCachedSnapshot = unstable_cache(
  async (): Promise<VeBalHoldersPayload> => {
    const snap = await fetchVeBalHoldersSnapshot()
    return {
      day: snap.day,
      rows: snap.rows,
      generatedAt: Math.floor(Date.now() / 1000),
    }
  },
  ['governance-vebal-holders-v2'],
  { revalidate: 604_800, tags: ['governance-vebal-holders-v2'] }
)

export async function GET() {
  try {
    return Response.json(await getCachedSnapshot(), {
      headers: {
        // Browser revalidates every minute; server's weekly
        // `unstable_cache` still ensures Dune sees one call per week per
        // server. The previous `max-age=86400` was a footgun — bumped
        // a Dune query and user-visible data sat stale for up to a day.
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    const empty: VeBalHoldersPayload = {
      day: '',
      rows: [],
      generatedAt: Math.floor(Date.now() / 1000),
    }
    return Response.json(
      { ...empty, error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
