'use client'

import { useEffect, useState } from 'react'
import { dedupedLoad, peekCached } from '@analytics/lib/upstream/request-cache'
import type { ProtocolSnapshotSeries } from './types'

export type SnapshotGranularity = 'hourly' | 'daily'

type State = {
  data: ProtocolSnapshotSeries
  loading: boolean
  error: Error | null
}

const EMPTY: ProtocolSnapshotSeries = { points: [], generatedAt: null }

/** Matches the `Cache-Control: max-age=60` the `/api/snapshots` route emits:
 *  once both expire, the next mount goes to the browser HTTP cache (or the
 *  network if that's also evicted). */
const CACHE_TTL_MS = 60_000

function cacheKey(days: number, granularity: SnapshotGranularity): string {
  return `snapshots:${days}:${granularity}`
}

function loadSnapshots(
  days: number,
  granularity: SnapshotGranularity
): Promise<ProtocolSnapshotSeries> {
  // Drop `cache: 'no-store'` so the browser HTTP cache (driven by
  // `Cache-Control` on /api/snapshots) actually serves. Within the
  // route's `max-age` window the fetch is a no-op locally.
  return fetch(`/api/snapshots?days=${days}&granularity=${granularity}`).then(r => {
    if (!r.ok) throw new Error(`snapshots HTTP ${r.status}`)
    return r.json() as Promise<ProtocolSnapshotSeries>
  })
}

/**
 * Reader hook for the cron-driven snapshot dataset.
 *
 * Fetches `/api/snapshots` through the shared module-level cache + in-flight
 * dedupe (`lib/upstream/request-cache.ts`) so the two on-page consumers —
 * `useKpiSparks` and `useTvlSeries` — collapse to one network request when
 * their params overlap, and skip the request entirely on rapid re-mounts —
 * StrictMode in dev doubles every effect, so a fresh landing-page mount
 * used to produce 4 parallel fetches with overlapping params.
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
  const key = cacheKey(days, granularity)

  // Initialize from the module cache when present — no loading flicker on
  // remount, on tab-switch back, or when a second consumer mounts with
  // params the first one has already resolved.
  const [state, setState] = useState<State>(() => {
    const cached = peekCached<ProtocolSnapshotSeries>(key, CACHE_TTL_MS)
    return cached
      ? { data: cached, loading: false, error: null }
      : { data: EMPTY, loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false

    dedupedLoad(key, CACHE_TTL_MS, () => loadSnapshots(days, granularity))
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
  }, [key, days, granularity])

  return state
}
