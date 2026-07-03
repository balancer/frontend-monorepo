'use client'

import { useEffect, useMemo, useState } from 'react'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import {
  isComposableStable,
  isFx,
  isMetaStable,
  isStable,
} from '@repo/lib/modules/pool/pool.helpers'
import type {
  PortfolioPnlPayload,
  PortfolioPnlPoolEntry,
} from '@analytics/app/api/portfolio/[address]/pnl/route'
import type { PortfolioPosition } from './usePortfolioByAddress'

export type PnlStatus =
  | 'computed'
  /** True pegged-asset pool (Stable / MetaStable / ComposableStable / FX).
   *  IL is vanishingly small by design; suppressed rather than shown as
   *  0.00% which reads as a load bug. NOTE: AutoRange (RECLAMM) and
   *  Gyro are NOT included — they can host volatile pairs too, so IL
   *  must be computed case-by-case. */
  | 'stable'
  /** No add events found for the position — either the indexer doesn't
   *  cover it, or BPTs were received via airdrop / migration. */
  | 'no_history'
  /** The api-v3 page cap clipped the user's history AND this pool's
   *  earliest known event is at the cutoff, so older adds may be missing.
   *  We don't compute because cost basis would be systematically wrong. */
  | 'truncated'
  /** Net deposited token amount went negative (more pulled out than put
   *  in). Cost basis isn't meaningful for a re-entered position; we'd need
   *  full FIFO lot tracking to handle this faithfully. */
  | 'exited_and_reentered'

function isPeggedAssetPool(type: GqlPoolType): boolean {
  return isStable(type) || isMetaStable(type) || isComposableStable(type) || isFx(type)
}

export type PnlResult = {
  status: PnlStatus
  /** Cost basis (USD). Always derived from event valueUSD snapshots. */
  costBasisUsd: number
  /** Current LP position USD. Mirrors `position.positionUsd`. */
  currentUsd: number
  /** Σ(net_amount × current_price). Same tokens as `currentUsd` would
   *  represent if no swaps had happened inside the pool. */
  hodlUsd: number
  /** currentUsd − costBasisUsd. Includes both fees collected and IL. */
  netPnlUsd: number
  netPnlPct: number
  /** currentUsd − hodlUsd. Negative = IL drag, positive = vol harvest. */
  ilUsd: number
  ilPct: number
  firstEventAt: number | null
  addCount: number
  removeCount: number
}

export type UsePortfolioPnlResult = {
  loading: boolean
  error: string | null
  /** P&L keyed by `${chain}:${poolId}`. `null` entries mean we have data
   *  but couldn't compute (see `status`). */
  byPoolKey: Record<string, PnlResult>
  truncated: boolean
}

const EMPTY: UsePortfolioPnlResult = {
  loading: false,
  error: null,
  byPoolKey: {},
  truncated: false,
}

export function usePortfolioPnl(
  address: string | null,
  positions: PortfolioPosition[]
): UsePortfolioPnlResult {
  const [asyncState, setAsyncState] = useState<{
    address: string
    payload: PortfolioPnlPayload
  } | { address: string; error: string } | null>(null)

  useEffect(() => {
    if (!address) return
    const controller = new AbortController()
    fetch(`/api/portfolio/${address}/pnl`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`pnl ${res.status}`)
        return (await res.json()) as PortfolioPnlPayload
      })
      .then(payload => setAsyncState({ address, payload }))
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setAsyncState({ address, error: err.message })
      })
    return () => controller.abort()
  }, [address])

  return useMemo<UsePortfolioPnlResult>(() => {
    if (!address) return EMPTY
    // Loading state is derived: we're loading whenever the async slot
    // doesn't yet hold a result for the current address.
    if (!asyncState || asyncState.address !== address) {
      return { ...EMPTY, loading: true }
    }
    if ('error' in asyncState) {
      return { ...EMPTY, error: asyncState.error }
    }
    const { payload } = asyncState
    const byPoolKey: Record<string, PnlResult> = {}

    // Defensive: a stale cached payload from a prior route version may
    // omit `cutoffsByChain` entirely. Treat that as "no cutoffs" rather
    // than crashing on undefined access.
    const cutoffsByChain = payload.cutoffsByChain ?? {}
    for (const position of positions) {
      const key = `${position.chain}:${position.pool.id.toLowerCase()}`
      // Cutoffs are per-chain: a heavy LP on Base doesn't taint pools on
      // Mainnet / Arbitrum etc. Fall back to nulls (no cutoff) when the
      // chain isn't in the response.
      const cutoffs = cutoffsByChain[position.chain] ?? { add: null, remove: null }
      const result = computePnl(
        position,
        payload.entries[key] ?? null,
        cutoffs.add,
        cutoffs.remove
      )
      byPoolKey[key] = result
    }

    return { loading: false, error: null, byPoolKey, truncated: payload.truncated }
  }, [address, asyncState, positions])
}

/**
 * Compute one position's P&L + IL from its raw events + current pool state.
 * Pure function — easy to unit-test in isolation later.
 *
 * `addCutoffTs` / `removeCutoffTs` are non-null only when api-v3 returned
 * the page cap for that event type. They mark the oldest timestamp present
 * in our response; any pool whose earliest event sits at or before the
 * cutoff is potentially missing older events. Pools strictly after the
 * cutoff are unaffected.
 */
function computePnl(
  position: PortfolioPosition,
  entry: PortfolioPnlPoolEntry | null,
  addCutoffTs: number | null,
  removeCutoffTs: number | null
): PnlResult {
  const currentUsd = position.positionUsd
  const blank = {
    costBasisUsd: 0,
    currentUsd,
    hodlUsd: 0,
    netPnlUsd: 0,
    netPnlPct: 0,
    ilUsd: 0,
    ilPct: 0,
    firstEventAt: entry?.firstEventAt ?? null,
    addCount: entry?.addCount ?? 0,
    removeCount: entry?.removeCount ?? 0,
  }

  if (isPeggedAssetPool(position.pool.type as GqlPoolType)) {
    return { ...blank, status: 'stable' }
  }

  // No events for this pool. If truncation happened, we genuinely don't
  // know whether the missing events belong to this pool or another. Show
  // as truncated rather than 'no_history' — the latter would be a
  // confidently-wrong claim that the user never deposited.
  if (!entry || entry.addCount === 0) {
    if (addCutoffTs !== null) return { ...blank, status: 'truncated' }
    return { ...blank, status: 'no_history' }
  }

  // This pool's earliest event sits at the api-v3 cutoff (within 1% of it)
  // → older events very likely exist that we didn't fetch. Cost basis
  // would be systematically off, so bail.
  const earliestEvent = Math.min(
    entry.firstEventAt ?? Number.POSITIVE_INFINITY,
    // Also factor in removes — a remove older than our earliest add would
    // mean we missed an add that preceded it.
    removeCutoffTs !== null && entry.removeCount > 0 ? removeCutoffTs : Number.POSITIVE_INFINITY
  )
  const cutoff = addCutoffTs ?? -Infinity
  // Within 1% margin (≈ a few minutes for unix timestamps) means events
  // at the cutoff were almost certainly clipped.
  if (cutoff > 0 && earliestEvent <= cutoff * 1.001) {
    return { ...blank, status: 'truncated' }
  }

  // If any net token quantity went negative the user has fully exited at
  // least once before topping up. A correct cost-basis calc would need to
  // realise the prior cycle's PnL (FIFO lots), which we don't track. Bail
  // rather than show a number that mixes two regimes.
  const netTokenAddrs = Object.keys(entry.netTokens)
  for (const addr of netTokenAddrs) {
    if (entry.netTokens[addr].amount < 0) {
      return { ...blank, status: 'exited_and_reentered' }
    }
  }

  // Live per-token USD price = balanceUSD / balance from the pool's
  // current poolTokens snapshot. Fall back to 0 (i.e. ignore that token)
  // when api-v3 doesn't price one — better than NaN propagating into HODL.
  const priceByAddr = new Map<string, number>()
  for (const t of position.pool.poolTokens ?? []) {
    const bal = Number(t.balance ?? 0)
    const balUsd = Number(t.balanceUSD ?? 0)
    if (bal > 0 && balUsd > 0) {
      priceByAddr.set(t.address.toLowerCase(), balUsd / bal)
    }
  }

  let hodlUsd = 0
  for (const addr of netTokenAddrs) {
    const { amount } = entry.netTokens[addr]
    if (amount <= 0) continue
    const price = priceByAddr.get(addr)
    if (price == null) continue // token no longer in pool snapshot — skip
    hodlUsd += amount * price
  }

  const costBasisUsd = entry.costBasisUsd
  const netPnlUsd = currentUsd - costBasisUsd
  const ilUsd = currentUsd - hodlUsd
  const netPnlPct = costBasisUsd > 0 ? netPnlUsd / costBasisUsd : 0
  const ilPct = hodlUsd > 0 ? ilUsd / hodlUsd : 0

  return {
    status: 'computed',
    costBasisUsd,
    currentUsd,
    hodlUsd,
    netPnlUsd,
    netPnlPct,
    ilUsd,
    ilPct,
    firstEventAt: entry.firstEventAt,
    addCount: entry.addCount,
    removeCount: entry.removeCount,
  }
}
