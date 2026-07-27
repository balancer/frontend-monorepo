'use client'

import { useEffect, useState } from 'react'
import type { VeBalHoldersPayload } from '@analytics/app/api/governance/vebal-holders/route'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

type State = {
  data: VeBalHoldersPayload | null
  loading: boolean
  error: Error | null
}

const INITIAL: State = { data: null, loading: true, error: null }

/** Reads the server-cached veBAL holder distribution
 *  (`/api/governance/vebal-holders`). Server refreshes weekly from Dune
 *  query 3645067; on the client we just consume the latest snapshot. */
export function useVeBalHolders(): State {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    // `cache: 'no-store'` — see `useGovernance` for rationale. The server's
    // weekly `unstable_cache` is what keeps Dune credit-burn low.
    fetchWithRetry('/api/governance/vebal-holders', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`vebal-holders HTTP ${r.status}`)
        return r.json() as Promise<VeBalHoldersPayload>
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
