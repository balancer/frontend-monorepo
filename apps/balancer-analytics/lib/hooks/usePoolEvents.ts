'use client'

import { useEffect, useState } from 'react'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChainValues } from '@repo/lib/config/networks'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import type {
  PoolEventsResponse,
  PoolParamEvent,
} from '@analytics/lib/pool-events/types'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

type State = {
  events: PoolParamEvent[]
  loading: boolean
  error: Error | null
  /** True the moment the network resolves — distinct from `loading` because
   *  the chart wants to show "indexing…" until the events fetch lands, even
   *  if the parent re-renders with stale data in the meantime. */
  loaded: boolean
  /** Lifted from the route payload so the parent can render incremental
   *  load-newer affordances if it wants. Not currently consumed by the
   *  pool page UI. */
  lastBlock: number | null
  /** Surfaced for the indexing UI: a cached response means the route hit
   *  the TTL fast path (≈no drpc walk). On a cold scan this is false and
   *  the chip should communicate "first sync may take a moment". */
  cached: boolean
}

const INITIAL: State = {
  events: [],
  loading: true,
  error: null,
  loaded: false,
  lastBlock: null,
  cached: false,
}

/**
 * Streams the pool's parameter-event timeline in *after* the page shell has
 * rendered, so the chart + snapshot tile can paint immediately while the
 * cold-path drpc log walk runs. Previously the page-level `syncPoolEvents`
 * call blocked the entire render — multi-second on first visits to a pool,
 * which made it look like the app had frozen.
 *
 * Two parts to the resolution strategy:
 *   - `fullHistory` mirrors the URL `?range` semantics from `page.tsx`:
 *     anything wider than 90d triggers the deep deployment-block scan. The
 *     route is internally idempotent — a `?fullHistory` GET on a pool that's
 *     already been deep-synced serves cached data.
 *   - Aborts in-flight fetches when chain/pool/fullHistory change so a fast
 *     range toggle doesn't pile up parallel scans (each scan is the
 *     expensive thing).
 */
export function usePoolEvents(
  chain: GqlChainValues,
  poolId: string,
  options: { fullHistory?: boolean } = {}
): State {
  const slug = chainToSlugMap[chain as GqlChain]
  const [state, setState] = useState<State>(INITIAL)
  const { fullHistory = false } = options

  useEffect(() => {
    if (!slug) return
    const qs = fullHistory ? '?fullHistory' : ''
    const url = `/api/pool/${slug}/${poolId.toLowerCase()}/events${qs}`
    const controller = new AbortController()
    // We intentionally do NOT reset to loading=true on dep change. Once
    // events have loaded once, range toggles that trigger a server-side
    // re-scan are rare (one deep scan per pool, then warm forever) and
    // pre-emptively hiding the existing markers would feel worse than
    // letting the old data linger for the few hundred ms of a warm
    // refetch. First-mount loading is covered by INITIAL.
    fetchWithRetry(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`pool events HTTP ${r.status}`)
        return r.json() as Promise<PoolEventsResponse>
      })
      .then(data => {
        if (controller.signal.aborted) return
        setState({
          events: data.events,
          loading: false,
          error: null,
          loaded: true,
          lastBlock: data.lastBlock,
          cached: data.cached,
        })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        if (error instanceof Error && error.name === 'AbortError') return
        setState(prev => ({
          events: prev.events,
          loading: false,
          error: error as Error,
          loaded: true,
          lastBlock: prev.lastBlock,
          cached: false,
        }))
      })

    return () => {
      controller.abort()
    }
  }, [slug, poolId, fullHistory])

  return state
}
