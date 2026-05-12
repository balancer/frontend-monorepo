'use client'

import { useEffect, useState } from 'react'
import type {
  BiggestSwap,
  BiggestSwapsPayload,
} from '@analytics/lib/biggest-swaps/types'

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
 * `revalidate = 300` (5 min). The previous live-tape hook polled api-v3
 * every 30s per visitor and was the main analytics-side load on the API.
 */
export function useBiggestSwaps() {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    fetch('/api/biggest-swaps')
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
        setState({ items: [], loading: false, error: error as Error, generatedAt: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
