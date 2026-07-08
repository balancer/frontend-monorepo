'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AnalyticsMerklPayload } from '@analytics/app/api/merkl/[address]/route'

export type UseMerklRewardsResult = {
  loading: boolean
  error: string | null
  payload: AnalyticsMerklPayload | null
}

const EMPTY: AnalyticsMerklPayload = { totalUnclaimedUsd: 0, rewards: [] }

type AsyncState =
  | { kind: 'pending'; address: string }
  | { kind: 'resolved'; address: string; payload: AnalyticsMerklPayload }
  | { kind: 'error'; address: string; error: string }

/**
 * Fetch the aggregated Merkl rewards payload for an address. The heavy
 * lifting (chain fan-out, aggregation, USD conversion) lives in the route
 * handler; this hook just owns lifecycle + abort.
 *
 * The `!address` branch is derived in render, not via an extra setState,
 * so toggling the input doesn't bounce through a no-op state cycle.
 */
export function useMerklRewards(address: string | null): UseMerklRewardsResult {
  const [asyncState, setAsyncState] = useState<AsyncState | null>(null)

  useEffect(() => {
    if (!address) return
    const controller = new AbortController()
    fetch(`/api/merkl/${address}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`merkl ${res.status}`)
        return (await res.json()) as AnalyticsMerklPayload
      })
      .then(payload => {
        setAsyncState({ kind: 'resolved', address, payload })
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setAsyncState({ kind: 'error', address, error: err.message })
      })
    return () => controller.abort()
  }, [address])

  return useMemo<UseMerklRewardsResult>(() => {
    if (!address) return { loading: false, error: null, payload: EMPTY }
    if (!asyncState || asyncState.address !== address) {
      return { loading: true, error: null, payload: null }
    }
    switch (asyncState.kind) {
      case 'pending':
        return { loading: true, error: null, payload: null }
      case 'resolved':
        return { loading: false, error: null, payload: asyncState.payload }
      case 'error':
        return { loading: false, error: asyncState.error, payload: null }
    }
  }, [address, asyncState])
}
