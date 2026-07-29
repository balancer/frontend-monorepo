'use client'

import { useEffect, useState } from 'react'
import type { BalSupplyPayload } from '@analytics/app/api/governance/bal-supply/route'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'
import { dedupedLoad, peekCached } from '@analytics/lib/upstream/request-cache'

type State = {
  data: BalSupplyPayload | null
  loading: boolean
  error: Error | null
}

const URL = '/api/governance/bal-supply'

/** Matches the route's `max-age=60`. Past this the shared browser/CDN cache
 *  takes over, so a longer TTL here would only add staleness, not save a hop. */
const TTL_MS = 60_000

function load(): Promise<BalSupplyPayload> {
  // `cache: 'no-store'` is deliberate: the server's `unstable_cache` is the
  // real cache, and bypassing the browser copy keeps the numbers honest on
  // revisit. The module cache above is what makes that affordable.
  return fetchWithRetry(URL, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error(`bal-supply HTTP ${r.status}`)
    return r.json() as Promise<BalSupplyPayload>
  })
}

/** Reads the server-cached BAL multi-chain supply feed
 *  (`/api/governance/bal-supply`). Freshness via the route's 10-min
 *  revalidate; supply ticks rarely so the cache is generous.
 *
 *  Two consumers mount this in the same commit (GovernanceHeroStrip and
 *  BalSupplyByChainCard). They share one request via the module-level
 *  dedupe — previously each fired its own, since `no-store` meant the
 *  browser cache couldn't fold them. */
export function useBalSupplyByChain(): State {
  const [state, setState] = useState<State>(() => {
    const cached = peekCached<BalSupplyPayload>(URL, TTL_MS)
    return cached
      ? { data: cached, loading: false, error: null }
      : { data: null, loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false
    dedupedLoad(URL, TTL_MS, load)
      .then(data => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch(error => {
        if (cancelled) return
        setState({ data: null, loading: false, error: error as Error })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
