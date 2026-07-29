'use client'

import {
  GetProtocolStatsPerChainQuery,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useEffect, useState } from 'react'
import type { ProtocolStatsByChainResponse } from '@analytics/app/api/protocol-stats-by-chain/route'
import { dedupedLoad, peekCached } from '@analytics/lib/upstream/request-cache'

export type ChainStat = GetProtocolStatsPerChainQuery['protocolMetricsChain'] & {
  chain: GqlChain
}

type State = {
  data: ChainStat[]
  loading: boolean
  error: Error | null
}

const URL = '/api/protocol-stats-by-chain'

/** Matches the route's `s-maxage=300`. */
const TTL_MS = 300_000

function load(): Promise<ChainStat[]> {
  return fetch(URL)
    .then(r => {
      if (!r.ok) throw new Error(`protocol-stats-by-chain HTTP ${r.status}`)
      return r.json() as Promise<ProtocolStatsByChainResponse>
    })
    .then(json => json.stats ?? [])
}

/**
 * Per-chain protocol metrics, already aggregated and sorted by TVL desc.
 *
 * Reads `/api/protocol-stats-by-chain`, which fans out across supported
 * networks server-side using one aliased api-v3 document and caches the
 * result. This hook previously did that fan-out in the browser — one Apollo
 * `GetProtocolStatsPerChain` per chain, ~12 direct api-v3 POSTs on every cold
 * landing-page visit. Apollo's cache made *repeat* renders free but did
 * nothing for first paint, which is where the rate-limit pressure came from.
 *
 * Two consumers mount this in the same commit (TvlByChainBars and
 * ProtocolHighlights via useDashboardHighlights); the module-level dedupe
 * folds them onto one request, replacing what Apollo's cache-first policy
 * used to do here.
 */
export function useChainProtocolStats(): State {
  const [state, setState] = useState<State>(() => {
    const cached = peekCached<ChainStat[]>(URL, TTL_MS)
    return cached
      ? { data: cached, loading: false, error: null }
      : { data: [], loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false
    dedupedLoad(URL, TTL_MS, load)
      .then(data => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch(err => {
        if (cancelled) return
        setState({ data: [], loading: false, error: err as Error })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
