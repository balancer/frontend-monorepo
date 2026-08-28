/**
 * Pure LP-vs-HODL basket math for the BPT price history chart. Split out of
 * `PoolBptPriceHistory.tsx` so it can be unit tested without pulling in
 * Chakra/ECharts — this file has no React, no I/O, just the t₀ basket-fixing
 * and forward-valuation logic.
 *
 * See the file-header comment in `PoolBptPriceHistory.tsx` for the full
 * rationale (wrapped vs underlying valuation on boosted pools).
 */

import type { TokenDailyPrices } from '@analytics/lib/hooks/useHodlComparison'
import type { PoolPageData } from '../../page'

export type Sample = PoolPageData['snapshots'][number]

/** The two legs of a token for the HODL basket: `wrapped` (what the pool
 *  actually holds, so its price gives the pool's USD value) and `hodl` (what
 *  the "just held it instead" basket is valued in — the *underlying* for a
 *  yield-bearing wrapper, else the token itself). Fixing the basket in
 *  underlying terms strips the wrapper's yield out of HODL so the LP's yield
 *  advantage shows, instead of accruing to both sides and cancelling. */
export type HodlToken = { wrapped: string; hodl: string }

/** Per-BPT HODL basket valued forward from a fixed reference point.
 *  `values[i]` aligns with `samples[i]` (null before t₀ or where a token is
 *  unpriced that day). `baseIndex` / `baseValue` are the t₀ anchor. */
export type HodlResult = {
  values: (number | null)[]
  baseIndex: number
  baseValue: number
}

const DAY = 86400
const dayStart = (tsSeconds: number): number => Math.floor(tsSeconds / DAY) * DAY

/** Price on the snapshot's UTC-day, walking back up to two weeks to bridge a
 *  missing bucket (token oracle gap) before giving up. */
function priceAt(daily: Map<number, number>, tsSeconds: number): number | null {
  const start = dayStart(tsSeconds)

  for (let back = 0; back <= 14; back++) {
    const p = daily.get(start - back * DAY)
    if (p != null) return p
  }

  return null
}

export function computeHodl(
  samples: Sample[],
  hodlTokens: HodlToken[],
  series: TokenDailyPrices[] | null
): HodlResult | null {
  if (!series || series.length === 0 || hodlTokens.length === 0) return null

  const byAddr = new Map(series.map(s => [s.address, s.daily]))

  // Each token needs two price series: `wrapped` (values the pool's holding,
  // in the ERC4626 units `amounts` is denominated in) and `hodl` (values the
  // fixed alternative basket — the underlying for a wrapper). For non-wrapped
  // tokens the two addresses are identical, so both resolve to one series.
  const legs = hodlTokens.map(t => ({
    wrapped: byAddr.get(t.wrapped),
    hodl: byAddr.get(t.hodl),
  }))

  if (legs.some(l => l.wrapped == null || l.hodl == null)) return null
  const priced = legs as { wrapped: Map<number, number>; hodl: Map<number, number> }[]

  // t₀ = first snapshot with a well-formed amounts vector and a price (both
  // legs) for every token. Almost always the range's first sample; later only
  // when a token's price history starts inside the window.
  //
  // Fix the HODL quantities *in underlying terms* here: the pool holds
  // `amounts/totalShares` wrapped tokens per BPT, worth `× wrappedPx(t₀)` in
  // USD; dividing by the underlying price at t₀ converts that to a fixed
  // underlying quantity. `wrappedPx/hodlPx` is exactly the ERC4626 conversion
  // rate at t₀ (== 1 for non-wrapped tokens). By construction the basket's t₀
  // value equals sharePrice(t₀), so both lines start together.
  let baseIndex = -1
  let qty: number[] | null = null

  for (const [i, s] of samples.entries()) {
    if (!s.amounts || s.amounts.length !== hodlTokens.length || !(s.totalShares > 0)) continue
    const wpx = priced.map(l => priceAt(l.wrapped, s.timestamp))
    const hpx = priced.map(l => priceAt(l.hodl, s.timestamp))
    if (wpx.some(p => p == null) || hpx.some(p => p == null)) continue
    qty = s.amounts.map((a, k) => (a / s.totalShares) * ((wpx[k] as number) / (hpx[k] as number)))
    baseIndex = i
    break
  }

  if (!qty || baseIndex < 0) return null

  const values: (number | null)[] = samples.map((s, i) => {
    if (i < baseIndex) return null
    const hpx = priced.map(l => priceAt(l.hodl, s.timestamp))
    if (hpx.some(p => p == null)) return null
    let v = 0
    for (let k = 0; k < qty!.length; k++) v += qty![k]! * (hpx[k] as number)
    return v
  })

  const baseValue = values[baseIndex]
  if (baseValue == null || !(baseValue > 0)) return null
  return { values, baseIndex, baseValue }
}
