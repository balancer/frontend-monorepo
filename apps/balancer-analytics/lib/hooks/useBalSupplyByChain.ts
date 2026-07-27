'use client'

import { useEffect, useState } from 'react'
import type { BalSupplyPayload } from '@analytics/app/api/governance/bal-supply/route'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

type State = {
  data: BalSupplyPayload | null
  loading: boolean
  error: Error | null
}

const INITIAL: State = { data: null, loading: true, error: null }

/** Reads the server-cached BAL multi-chain supply feed
 *  (`/api/governance/bal-supply`). Freshness via the route's 10-min
 *  revalidate; supply ticks rarely so the cache is generous. */
export function useBalSupplyByChain(): State {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    fetchWithRetry('/api/governance/bal-supply', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`bal-supply HTTP ${r.status}`)
        return r.json() as Promise<BalSupplyPayload>
      })
      .then(data => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch(error => {
        if (cancelled) return
        if (error instanceof Error && error.name === 'AbortError') return
        setState({ data: null, loading: false, error: error as Error })
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return state
}
