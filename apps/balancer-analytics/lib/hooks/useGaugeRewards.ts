'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AnalyticsGaugeRewardsPayload } from '@analytics/app/api/portfolio/[address]/gauge-rewards/route'
import { dedupedLoad } from '@analytics/lib/upstream/request-cache'

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

/** Matches the route's `max-age=300`. */
const TTL_MS = 300_000

type AsyncState =
  | { kind: 'pending'; address: string }
  | { kind: 'resolved'; address: string; payload: AnalyticsGaugeRewardsPayload }
  | { kind: 'error'; address: string; error: string }

/**
 * Fetch aggregated gauge-claimable rewards for an address. The server-side
 * route handles api-v3 lookup, the multicall fan-out, and price conversion;
 * this hook owns lifecycle.
 *
 * PortfolioKpiStrip and PortfolioMerklCard both mount this in the same
 * commit, so the request is shared via the module-level dedupe rather than
 * fired twice — this route does a multi-chain multicall fan-out server-side,
 * so the duplicate was expensive. No per-caller abort: one card unmounting
 * must not cancel the fetch the other is awaiting.
 */
export function useGaugeRewards(address: string | null): UseGaugeRewardsResult {
  const [asyncState, setAsyncState] = useState<AsyncState | null>(null)

  useEffect(() => {
    if (!address) return
    let cancelled = false
    const url = `/api/portfolio/${address}/gauge-rewards`
    dedupedLoad(url, TTL_MS, () =>
      fetch(url).then(async res => {
        if (!res.ok) throw new Error(`gauge-rewards ${res.status}`)
        return (await res.json()) as AnalyticsGaugeRewardsPayload
      })
    )
      .then(payload => {
        if (cancelled) return
        setAsyncState({ kind: 'resolved', address, payload })
      })
      .catch((err: Error) => {
        if (cancelled) return
        setAsyncState({ kind: 'error', address, error: err.message })
      })
    return () => {
      cancelled = true
    }
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
