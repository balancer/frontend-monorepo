'use client'

import { useEffect, useState } from 'react'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChainValues } from '@repo/lib/config/networks'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'
import type {
  AutoRangeHistoryResponse,
} from '@analytics/app/api/pool/[chain]/[id]/autorange-history/route'
import type { AutoRangeHistoryPoint } from '@analytics/lib/pool-state/autorange-history'

/** Cached fetch result. Includes the request key that produced it so the
 *  hook can derive `loading` by comparing the cache against the active
 *  props — no separate `loading` flag to reset on every prop change,
 *  which avoids the "setState in effect" cascade-render footgun. */
type CachedResult = {
  key: string
  samples: AutoRangeHistoryPoint[]
  error: Error | null
}

type State = {
  samples: AutoRangeHistoryPoint[]
  loading: boolean
  error: Error | null
  /** Resolves true once the network call returns (success or 4xx) and the
   *  cache key matches the active props. Used to gate the chart vs the
   *  loading skeleton. */
  loaded: boolean
}

/** Range string that maps to the API route's `?range=` query. Mirrors
 *  `PoolHistoryRange` in the page module — kept loosely typed here so a
 *  future range value doesn't require touching the hook. */
export type AutoRangeHistoryRange = '30d' | '90d' | '180d' | '1y' | 'all'

/**
 * Streams the AutoRange bounds history in *after* the page shell has
 * rendered. Matches the pattern of `usePoolEvents` — the archive fan-out
 * for a wide range can take a few seconds on cold drpc, so we never
 * block the main page render on it.
 *
 * Loading state is derived (not stored) from a key comparison between
 * the active `(chain, pool, range)` triple and whatever the most recent
 * completed fetch resolved against. When range changes, the old cached
 * samples instantly stop matching and the UI sees `loading: true` —
 * without a synchronous `setState` reset inside the effect (which would
 * cascade an extra render).
 *
 * Aborts in-flight fetches when chain/pool/range change so toggling the
 * range doesn't pile up parallel archive scans.
 */
export function useAutoRangeHistory(
  chain: GqlChainValues,
  poolId: string,
  range: AutoRangeHistoryRange
): State {
  const slug = chainToSlugMap[chain as GqlChain]
  const requestKey = `${slug}|${poolId.toLowerCase()}|${range}`
  const [cached, setCached] = useState<CachedResult | null>(null)

  useEffect(() => {
    if (!slug) return
    const url = `/api/pool/${slug}/${poolId.toLowerCase()}/autorange-history?range=${range}`
    const controller = new AbortController()

    fetchWithRetry(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`autorange history HTTP ${r.status}`)
        return r.json() as Promise<AutoRangeHistoryResponse>
      })
      .then(data => {
        if (controller.signal.aborted) return
        setCached({ key: requestKey, samples: data.samples, error: null })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        if (error instanceof Error && error.name === 'AbortError') return
        setCached({ key: requestKey, samples: [], error: error as Error })
      })

    return () => {
      controller.abort()
    }
  }, [slug, poolId, range, requestKey])

  // Derive the public state from the cache key. When `range` changes mid-
  // flight, `cached.key !== requestKey` until the new fetch lands — so the
  // consumer sees `loading: true` and `samples: []` without us touching
  // state during the effect's body.
  const isFresh = cached?.key === requestKey
  return {
    samples: isFresh ? cached!.samples : [],
    error: isFresh ? cached!.error : null,
    loading: !isFresh,
    loaded: isFresh,
  }
}
