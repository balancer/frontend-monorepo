'use client'

/**
 * Pulls the data the pool-vs-pool comparison modal needs for the target pool:
 *
 *   - 30-day snapshot series via api-v3's `poolGetSnapshots` (the same query
 *     `PoolChartsProvider` uses on frontend-v3, so Apollo dedupes whenever
 *     the user has the target pool open elsewhere in the same session).
 *   - Current on-chain parameter state via `/api/pool/[chain]/[id]/state`
 *     (the route already exists for the pool-detail page's right rail). The
 *     route runs a VaultExplorer + getter multicall, so we get swap-fee +
 *     aggregate-fee + amp + paused/recovery flags in one round trip.
 *
 * The source-side pool already has both — snapshots are the chart's payload
 * and state is `data.state.universal`. So the hook is target-only; the
 * comparison modal aligns the two halves at render time.
 */

import { useEffect, useState } from 'react'
import { GqlPoolSnapshotDataRangeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { useQuery } from '@apollo/client/react'
import { GetPoolSnapshotsDocument, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import type { GqlChainValues } from '@repo/lib/config/networks'
import type { PoolStateResponse } from '@analytics/lib/pool-events/types'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'

/** Trimmed view of `PoolStateResponse.universal` — keeps the comparison
 *  modal honest about which fields are guaranteed to exist (the same set
 *  PoolStatePanel surfaces in its universal section). */
export type ComparisonState = {
  swapFeePercentage: string | null
  aggregateSwapFeePercentage: string | null
  aggregateYieldFeePercentage: string | null
  isPaused: boolean | null
  isInRecoveryMode: boolean | null
} | null

export type ComparisonSnapshot = {
  timestamp: number
  totalLiquidity: number
  volume24h: number
  fees24h: number
  surplus24h: number
  sharePrice: number
}

export type ComparisonAmpState = {
  amplificationParameter: string | null
  amplificationState: {
    /** Raw on-chain amp value scaled by precision. */
    value: string
    /** Precision divisor (1000 on every chain we serve today). */
    precision: string
    /** True while a `startAmplificationParameterUpdate` ramp is mid-flight. */
    isUpdating: boolean
  } | null
} | null

export type ComparisonData = {
  snapshots: ComparisonSnapshot[]
  state: ComparisonState
  amp: ComparisonAmpState
  snapshotsLoading: boolean
  stateLoading: boolean
  error: Error | null
}

const EMPTY: ComparisonData = {
  snapshots: [],
  state: null,
  amp: null,
  snapshotsLoading: false,
  stateLoading: false,
  error: null,
}

/**
 * Returns `EMPTY` (no fetch issued) when `chain`/`poolId` are not both set.
 * The picker modal mounts the comparison modal lazily, but keeping this
 * hook tolerant of nulls means consumers don't have to short-circuit a
 * `useQuery` themselves.
 */
export function useComparisonPool(
  chain: GqlChainValues | null,
  poolId: string | null
): ComparisonData {
  const slug = chain ? chainToSlugMap[chain as GqlChain] : null
  const skipSnapshots = !chain || !poolId
  const skipState = !slug || !poolId

  const {
    data,
    loading: snapshotsLoading,
    error: snapshotsError,
  } = useQuery(GetPoolSnapshotsDocument, {
    variables: {
      poolId: (poolId ?? '').toLowerCase(),
      chainId: (chain ?? 'MAINNET') as GqlChain,
      range: GqlPoolSnapshotDataRangeValues.ThirtyDays,
    },
    skip: skipSnapshots,
    fetchPolicy: 'cache-first',
  })

  const [stateRes, setStateRes] = useState<{
    state: ComparisonState
    amp: ComparisonAmpState
    loading: boolean
    error: Error | null
  }>({ state: null, amp: null, loading: !skipState, error: null })

  useEffect(() => {
    if (skipState) return
    const controller = new AbortController()
    fetchWithRetry(`/api/pool/${slug}/${(poolId ?? '').toLowerCase()}/state`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`pool state HTTP ${r.status}`)
        return r.json() as Promise<PoolStateResponse>
      })
      .then(payload => {
        if (controller.signal.aborted) return
        // `typeSpecific` is a `Record<string, unknown>` on the wire — the
        // amp keys live inside it for stable pools, both V2 and V3. Pick
        // them off defensively; anything else gets surfaced via state's
        // universal block.
        const ts = (payload.typeSpecific ?? {}) as {
          amplificationParameter?: string | null
          amplificationState?: {
            value?: string
            precision?: string
            isUpdating?: boolean
          } | null
        }
        const amp: ComparisonAmpState =
          ts.amplificationParameter || ts.amplificationState
            ? {
                amplificationParameter: ts.amplificationParameter ?? null,
                amplificationState: ts.amplificationState
                  ? {
                      value: ts.amplificationState.value ?? '0',
                      precision: ts.amplificationState.precision ?? '1000',
                      isUpdating: !!ts.amplificationState.isUpdating,
                    }
                  : null,
              }
            : null
        setStateRes({
          state: payload.universal,
          amp,
          loading: false,
          error: null,
        })
      })
      .catch(err => {
        if (controller.signal.aborted) return
        if (err instanceof Error && err.name === 'AbortError') return
        setStateRes({ state: null, amp: null, loading: false, error: err as Error })
      })

    return () => {
      controller.abort()
    }
  }, [slug, poolId, skipState])

  if (skipSnapshots && skipState) return EMPTY

  const snapshots: ComparisonSnapshot[] = (data?.snapshots ?? []).map(s => ({
    timestamp: s.timestamp,
    totalLiquidity: Number(s.totalLiquidity),
    volume24h: Number(s.volume24h),
    fees24h: Number(s.fees24h),
    surplus24h: Number(s.surplus24h),
    sharePrice: Number(s.sharePrice),
  }))

  return {
    snapshots,
    state: stateRes.state,
    amp: stateRes.amp,
    snapshotsLoading,
    stateLoading: stateRes.loading,
    error: (snapshotsError as Error | undefined) ?? stateRes.error,
  }
}
