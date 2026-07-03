'use client'

import { useEffect, useState } from 'react'
import type { VeBalStatsPayload } from '@analytics/app/api/governance/vebal-stats/route'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

type State = {
  data: VeBalStatsPayload | null
  loading: boolean
  error: Error | null
}

const INITIAL: State = { data: null, loading: true, error: null }

/** Reads the server-cached veBAL aggregate stats
 *  (`/api/governance/vebal-stats`). One mainnet multicall, 10-min cache. */
export function useVeBalStats(): State {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    fetchWithRetry('/api/governance/vebal-stats', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`vebal-stats HTTP ${r.status}`)
        return r.json() as Promise<VeBalStatsPayload>
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
