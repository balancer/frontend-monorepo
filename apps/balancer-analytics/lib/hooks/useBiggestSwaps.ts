'use client'

import { useEffect, useState } from 'react'
import type {
  BiggestSwap,
  BiggestSwapsPayload,
} from '@analytics/lib/biggest-swaps/types'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

export type { BiggestSwap }

type State = {
  items: BiggestSwap[]
  loading: boolean
  error: Error | null
  generatedAt: number | null
}

const INITIAL: State = { items: [], loading: true, error: null, generatedAt: null }

/**
 * Reads the server-cached top-swaps feed (`/api/biggest-swaps`). Single
 * fetch on mount, no polling — freshness comes from the route's
 * `revalidate = 3600` (1 h). The previous live-tape hook polled api-v3
 * every 30s per visitor and was the main analytics-side load on the API.
 */
export function useBiggestSwaps() {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    fetchWithRetry('/api/biggest-swaps', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`biggest-swaps HTTP ${r.status}`)
        return r.json() as Promise<BiggestSwapsPayload>
      })
      .then(data => {
        if (cancelled) return
        setState({
          items: data.items,
          loading: false,
          error: null,
          generatedAt: data.generatedAt,
        })
      })
      .catch(error => {
        if (cancelled) return
        if (error instanceof Error && error.name === 'AbortError') return
        setState({ items: [], loading: false, error: error as Error, generatedAt: null })
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return state
}
