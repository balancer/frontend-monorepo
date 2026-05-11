'use client'

import { useEffect, useState } from 'react'
import type { ProtocolSnapshotSeries } from './types'

type State = {
  data: ProtocolSnapshotSeries
  loading: boolean
  error: Error | null
}

const EMPTY: ProtocolSnapshotSeries = { points: [], generatedAt: null }

/**
 * Reader hook for the cron-driven snapshot dataset.
 *
 * Fetches `/api/snapshots` (server route reads from Postgres, see
 * `app/api/snapshots/route.ts`). The route is cached for 10 min so the
 * client hitting it on every mount is cheap.
 *
 * Returns the shape declared in `./types.ts` — aggregate values on the top
 * level of each `ProtocolSnapshotPoint`, per-chain breakdown under `byChain`.
 */
export function useProtocolSnapshots({ days = 90 }: { days?: number } = {}) {
  const [state, setState] = useState<State>({ data: EMPTY, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    // No synchronous `setState({ loading: true })` here — the lint rule
    // `react-hooks/set-state-in-effect` forbids it, and showing the prior
    // points while a re-fetch is in flight is the better UX anyway. The
    // initial mount lands in `loading: true` from the state initializer.
    fetch(`/api/snapshots?days=${days}`, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`snapshots HTTP ${r.status}`)
        return r.json() as Promise<ProtocolSnapshotSeries>
      })
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
  }, [days])

  return state
}
