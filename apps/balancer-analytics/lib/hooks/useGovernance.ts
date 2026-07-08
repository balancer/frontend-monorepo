'use client'

import { useEffect, useState } from 'react'
import type { GovernancePayload, GovernanceProposal } from '@analytics/lib/governance/types'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

export type { GovernanceProposal }

type State = {
  items: GovernanceProposal[]
  loading: boolean
  error: Error | null
  generatedAt: number | null
  space: string | null
}

const INITIAL: State = {
  items: [],
  loading: true,
  error: null,
  generatedAt: null,
  space: null,
}

/**
 * Reads the server-cached governance feed (`/api/governance`). Single fetch
 * on mount; freshness comes from the route's `revalidate = 600` (10 min).
 */
export function useGovernance() {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    // `cache: 'no-store'` bypasses the browser's HTTP cache so the user
    // sees freshly-revalidated data on every page load. The real cache
    // lives in `unstable_cache` on the server (10-min revalidate), so this
    // costs one tiny HTTP roundtrip per visit, not a Snapshot call.
    fetchWithRetry('/api/governance', { cache: 'no-store', signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`governance HTTP ${r.status}`)
        return r.json() as Promise<GovernancePayload>
      })
      .then(data => {
        if (cancelled) return
        setState({
          items: data.items,
          loading: false,
          error: null,
          generatedAt: data.generatedAt,
          space: data.space,
        })
      })
      .catch(error => {
        if (cancelled) return
        if (error instanceof Error && error.name === 'AbortError') return
        setState({
          items: [],
          loading: false,
          error: error as Error,
          generatedAt: null,
          space: null,
        })
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return state
}
