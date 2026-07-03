'use client'

import { useEffect, useState } from 'react'
import type { ProtocolSnapshotSeries } from './types'

export type SnapshotGranularity = 'hourly' | 'daily'

type State = {
  data: ProtocolSnapshotSeries
  loading: boolean
  error: Error | null
}

const EMPTY: ProtocolSnapshotSeries = { points: [], generatedAt: null }

// ── Module-level cache + dedupe ────────────────────────────────────────
//
// Two consumers (HeroKpiStrip via useKpiSparks, TvlOverviewChart via
// useTvlSeries) hit this hook independently. Without coordination they
// each fire their own `/api/snapshots` request on mount — and StrictMode
// in dev doubles every effect, so a fresh landing-page mount used to
// produce 4 parallel fetches with overlapping params.
//
// This module-level cache resolves both problems with one tiny store:
//   - `inflight` entries fold concurrent callers with identical params
//     onto a single fetch promise.
//   - `settled` entries are reused within `CACHE_TTL_MS`, skipping the
//     network roundtrip *and* the JSON parse + state churn entirely.
//
// `CACHE_TTL_MS = 60_000` aligns with the `Cache-Control: max-age=60` the
// `/api/snapshots` route now emits: once both expire, the next mount
// goes to the browser HTTP cache (or the network if that's also evicted).
//
// On error we delete the entry so the next visit retries cleanly.

const CACHE_TTL_MS = 60_000

type CacheEntry =
  | { state: 'inflight'; promise: Promise<ProtocolSnapshotSeries> }
  | { state: 'settled'; data: ProtocolSnapshotSeries; ts: number }

const cache = new Map<string, CacheEntry>()

function cacheKey(days: number, granularity: SnapshotGranularity): string {
  return `${days}:${granularity}`
}

function readCached(days: number, granularity: SnapshotGranularity): ProtocolSnapshotSeries | null {
  const e = cache.get(cacheKey(days, granularity))
  if (e?.state === 'settled' && Date.now() - e.ts < CACHE_TTL_MS) return e.data
  return null
}

function loadSnapshots(
  days: number,
  granularity: SnapshotGranularity
): Promise<ProtocolSnapshotSeries> {
  const key = cacheKey(days, granularity)
  const e = cache.get(key)
  if (e?.state === 'inflight') return e.promise
  if (e?.state === 'settled' && Date.now() - e.ts < CACHE_TTL_MS) {
    return Promise.resolve(e.data)
  }
  // Drop `cache: 'no-store'` so the browser HTTP cache (driven by
  // `Cache-Control` on /api/snapshots) actually serves. Within the
  // route's `max-age` window the fetch is a no-op locally.
  const promise = fetch(`/api/snapshots?days=${days}&granularity=${granularity}`)
    .then(r => {
      if (!r.ok) throw new Error(`snapshots HTTP ${r.status}`)
      return r.json() as Promise<ProtocolSnapshotSeries>
    })
    .then(data => {
      cache.set(key, { state: 'settled', data, ts: Date.now() })
      return data
    })
    .catch(err => {
      cache.delete(key)
      throw err
    })
  cache.set(key, { state: 'inflight', promise })
  return promise
}

/**
 * Reader hook for the cron-driven snapshot dataset.
 *
 * Fetches `/api/snapshots` through a module-level cache + in-flight
 * dedupe (see above) so the two on-page consumers — `useKpiSparks` and
 * `useTvlSeries` — collapse to one network request when their params
 * overlap, and skip the request entirely on rapid re-mounts.
 *
 * `granularity` controls cadence: `hourly` (default) returns every cron
 * row; `daily` collapses to one row per UTC day per (chain, protocol).
 * Use daily for long ranges where intra-day fidelity isn't worth the
 * ~24× payload.
 *
 * Returns the shape declared in `./types.ts` — aggregate values on the
 * top level of each `ProtocolSnapshotPoint`, per-chain breakdown under
 * `byChain`.
 */
export function useProtocolSnapshots({
  days = 90,
  granularity = 'hourly',
}: { days?: number; granularity?: SnapshotGranularity } = {}) {
  // Initialize from the module cache when present — no loading flicker on
  // remount, on tab-switch back, or when a second consumer mounts with
  // params the first one has already resolved.
  const [state, setState] = useState<State>(() => {
    const cached = readCached(days, granularity)
    return cached
      ? { data: cached, loading: false, error: null }
      : { data: EMPTY, loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false
    loadSnapshots(days, granularity)
      .then(data => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch(error => {
        if (cancelled) return
        setState({ data: EMPTY, loading: false, error: error as Error })
      })
    return () => {
      cancelled = true
    }
  }, [days, granularity])

  return state
}
