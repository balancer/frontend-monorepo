'use client'

/**
 * Fetches per-token historical USD prices for the LP-vs-HODL overlay on the
 * pool-detail BPT price chart. Streams in *after* the page shell renders —
 * the BPT price line (built from the already-on-page `sharePrice` series)
 * paints immediately; this fetch only feeds the second "HODL" series.
 *
 * Goes through the server route `/api/token-prices` (NOT api-v3 directly): the
 * route server-caches the upstream `tokenGetHistoricalPrices` call, so repeat
 * views and shared tokens dedupe onto one upstream request instead of every
 * browser hammering api-v3 and tripping its rate limit. The route also returns
 * the series already bucketed to one point per UTC-day, so there's no
 * client-side bucketing left to do here.
 *
 * Loading is derived from a request-key comparison (mirrors
 * `useAutoRangeHistory`) so a range/pool change doesn't need a setState reset
 * inside the effect — the stale cache simply stops matching the active key.
 */

import { useEffect, useState } from 'react'
import { fetchWithRetry } from '@analytics/lib/upstream/fetch-retry'
import type { HodlPricesResponse } from '@analytics/app/api/token-prices/route'

/** One token's price history, bucketed to UTC-day starts (unix seconds) →
 *  USD price. `address` is lower-cased for lookup by the consumer. */
export type TokenDailyPrices = {
  address: string
  daily: Map<number, number>
}

type CachedResult = {
  key: string
  series: TokenDailyPrices[]
  error: Error | null
}

export type HodlPricesState = {
  series: TokenDailyPrices[] | null
  loading: boolean
  error: Error | null
}

/**
 * Returns `{ series: null, loading: false }` (no fetch) when disabled or when
 * there are no token addresses. `series` is null while loading and on error;
 * consumers treat a null/short series as "hide the HODL overlay".
 *
 * @param range analytics range string (`'30d' | '90d' | '180d' | '1y' | 'all'`)
 *   — forwarded to the route, which maps it to api-v3's token-chart enum.
 */
export function useHodlComparison(
  chain: string | null,
  addresses: string[],
  range: string,
  enabled: boolean
): HodlPricesState {
  // Lower-case + sort so the key is stable regardless of token ordering, and
  // so it doubles as a primitive dep (avoids the changing-array-identity
  // effect-loop that a raw `addresses` dep would cause).
  const addressesKey = addresses.map(a => a.toLowerCase()).join(',')
  const active = enabled && !!chain && addresses.length > 0
  const requestKey = active ? `${chain}|${range}|${addressesKey}` : ''

  const [cached, setCached] = useState<CachedResult | null>(null)

  useEffect(() => {
    if (!active || !chain) return
    const controller = new AbortController()

    const url = `/api/token-prices?chain=${encodeURIComponent(chain)}&addresses=${encodeURIComponent(
      addressesKey
    )}&range=${encodeURIComponent(range)}`

    fetchWithRetry(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`token prices HTTP ${r.status}`)
        return r.json() as Promise<HodlPricesResponse>
      })
      .then(json => {
        if (controller.signal.aborted) return
        const series: TokenDailyPrices[] = (json.series ?? []).map(t => ({
          address: t.address.toLowerCase(),
          daily: new Map(t.daily),
        }))
        setCached({ key: requestKey, series, error: null })
      })
      .catch(error => {
        if (controller.signal.aborted) return
        if (error instanceof Error && error.name === 'AbortError') return
        setCached({ key: requestKey, series: [], error: error as Error })
      })

    return () => {
      controller.abort()
    }
  }, [active, chain, range, addressesKey, requestKey])

  if (!active) return { series: null, loading: false, error: null }

  const isFresh = cached?.key === requestKey
  return {
    series: isFresh ? cached!.series : null,
    loading: !isFresh,
    error: isFresh ? cached!.error : null,
  }
}
