'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AnalyticsGaugeRewardsPayload } from '@analytics/app/api/portfolio/[address]/gauge-rewards/route'

export type UseGaugeRewardsResult = {
  loading: boolean
  error: string | null
  payload: AnalyticsGaugeRewardsPayload | null
}

const EMPTY: AnalyticsGaugeRewardsPayload = {
  totalUnclaimedUsd: 0,
  rewards: [],
  chainErrors: {},
}

type AsyncState =
  | { kind: 'pending'; address: string }
  | { kind: 'resolved'; address: string; payload: AnalyticsGaugeRewardsPayload }
  | { kind: 'error'; address: string; error: string }

/**
 * Fetch aggregated gauge-claimable rewards for an address. The server-side
 * route handles api-v3 lookup, the multicall fan-out, and price conversion;
 * this hook owns lifecycle + abort.
 */
export function useGaugeRewards(address: string | null): UseGaugeRewardsResult {
  const [asyncState, setAsyncState] = useState<AsyncState | null>(null)

  useEffect(() => {
    if (!address) return
    const controller = new AbortController()
    fetch(`/api/portfolio/${address}/gauge-rewards`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`gauge-rewards ${res.status}`)
        return (await res.json()) as AnalyticsGaugeRewardsPayload
      })
      .then(payload => setAsyncState({ kind: 'resolved', address, payload }))
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setAsyncState({ kind: 'error', address, error: err.message })
      })
    return () => controller.abort()
  }, [address])

  return useMemo<UseGaugeRewardsResult>(() => {
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
