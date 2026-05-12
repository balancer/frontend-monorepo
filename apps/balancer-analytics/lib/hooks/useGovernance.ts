'use client'

import { useEffect, useState } from 'react'
import type { GovernancePayload, GovernanceProposal } from '@analytics/lib/governance/types'

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
    fetch('/api/governance')
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
    }
  }, [])

  return state
}
