/**
 * Strip CoW-settlement fee "rebates" from a pool's parameter timeline.
 *
 * Balancer V2 pools that opt into CoW's MEV-capturing flow have their static
 * swap fee temporarily lowered by the solver *inside* a settlement
 * transaction and then restored to the original value before that same tx
 * ends — the discount only ever applies to the CoW swap. Both writes emit
 * `SwapFeePercentageChanged`, so a naive index records two fee "changes" that
 * net to no change in the pool config. That noise:
 *
 *   - pollutes the chart markers and the event log,
 *   - and, worse on V2, consumes the per-scan row cap (`V2_EVENT_HARD_CAP`)
 *     so genuine Gauntlet fee-setter changes get evicted by rebate churn.
 *
 * We only want to keep a fee change when *that was the only thing that
 * happened* — i.e. a standalone write that actually moved the pool's fee,
 * such as the Gauntlet dynamic-fee setter. The rebate's lower-then-restore
 * pair is dropped entirely.
 *
 * ## Detection
 *
 * Signature of a rebate: two-or-more `SwapFeePercentageChanged` for the pool
 * in the **same transaction** whose net effect returns the fee to the value
 * in force *before* the tx. A pool's logs for a given tx all live in one
 * block and are always synced together, so a rebate pair is never split
 * across sync batches — grouping by `tx_hash` is reliable.
 *
 * The function maintains the running fee as it walks the timeline in order:
 *
 *   - A tx group of ≥2 fee events whose final value equals the running fee
 *     (or the running fee is not yet known — the start-of-window case, where
 *     a ≥2 round-trip is overwhelmingly a rebate) → drop the whole group.
 *   - Otherwise the group genuinely moved the fee → keep only its final
 *     write (collapsing any intra-tx steps) and advance the running fee.
 *
 * Pure and order-preserving. Non-fee events pass through untouched. Safe to
 * run on a partial sync batch (decode time, pre-cap) and on the full
 * persisted timeline (read time — also cleans rebate rows written before
 * this filter existed). V3's `SwapFeePercentageChanged` never round-trips in
 * a single tx, so applying this to any version is a no-op there.
 */

import type { PoolParamEventRow } from '@analytics/lib/db'

const FEE_EVENT = 'SwapFeePercentageChanged'

function feeValue(row: PoolParamEventRow): string | undefined {
  const v = row.args.swapFeePercentage
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return undefined
}

export type RebateStripResult = {
  rows: PoolParamEventRow[]
  /** Count of fee events dropped as CoW rebate round-trips. */
  stripped: number
}

export function stripFeeRebates(rows: readonly PoolParamEventRow[]): RebateStripResult {
  // Chronological order is required for the running-fee walk; callers can't
  // be assumed to pre-sort (decode concatenates Filter A + B; chunked
  // getLogs may interleave).
  const ordered = [...rows].sort((a, b) =>
    a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber - b.blockNumber
  )

  // Group fee events by tx, preserving order within each group.
  const feeGroups = new Map<string, PoolParamEventRow[]>()
  for (const r of ordered) {
    if (r.eventName !== FEE_EVENT) continue
    const g = feeGroups.get(r.txHash)
    if (g) g.push(r)
    else feeGroups.set(r.txHash, [r])
  }

  const dropped = new Set<PoolParamEventRow>()
  let runningFee: string | undefined

  for (const r of ordered) {
    if (r.eventName !== FEE_EVENT) continue
    const group = feeGroups.get(r.txHash)!
    if (group[0] !== r) continue // each group processed once, at its head

    const feeBefore = runningFee
    const finalVal = feeValue(group[group.length - 1])
    const isRoundTrip =
      group.length >= 2 && (feeBefore === undefined || finalVal === feeBefore)

    if (isRoundTrip) {
      for (const e of group) dropped.add(e)
      // running fee unchanged — the config returned to `feeBefore`
    } else {
      // Genuine fee move: keep only the final write, collapse intra-tx steps.
      for (let i = 0; i < group.length - 1; i++) dropped.add(group[i])
      if (finalVal !== undefined) runningFee = finalVal
    }
  }

  return {
    rows: ordered.filter(r => !dropped.has(r)),
    stripped: dropped.size,
  }
}
