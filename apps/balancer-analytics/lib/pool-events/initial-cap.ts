/**
 * 90-day initial-history cap (see POOL_EXPLORER_DESIGN.md §8).
 *
 * On cold start we don't walk the full pool history — we cap at 90 days and
 * surface a "Load full history" affordance in the UI. The cap is computed
 * by `(head − blocksPerWindow)` using an average block time per chain.
 *
 * Average block times are intentionally pessimistic (slightly *high* where
 * uncertain) so we don't accidentally over-shoot and burn request budget on
 * a chain we mis-estimated. Sources: chain explorers, public block-time
 * dashboards.
 *
 * The cap is a *floor* — if api-v3 reports a `createTime` later than
 * `head − blocksPerWindow`, we start from the pool's actual deployment
 * block instead (no point scanning blocks before the pool existed). That
 * lookup happens in `sync.ts`, not here.
 */

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { secondsPerBlock } from '@analytics/lib/networks/chain-info'

export const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60
export const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60

/**
 * Return the `fromBlock` for a 90-day cold-start scan, given the current head.
 * Never goes below 0n. Callers should clamp further if they know the pool's
 * deployment block.
 */
export function ninetyDayFromBlock(chain: GqlChain, head: bigint): bigint {
  const blocks = BigInt(Math.ceil(NINETY_DAYS_SECONDS / secondsPerBlock(chain)))
  return head > blocks ? head - blocks : 0n
}

/**
 * Return the `fromBlock` for a 30-day cold-start scan. Used for V2 pools,
 * where dynamic-fee Filter B events (`SwapFeePercentageChanged`,
 * `AmpUpdateStarted`, etc.) can fire dozens or hundreds of times per pool
 * over a quarter — the 90-day window would write hundreds of rows for
 * little additional signal. 30 days plus the 100-event hard cap in
 * `sync.ts` bounds V2 DB writes by an order of magnitude.
 */
export function thirtyDayFromBlock(chain: GqlChain, head: bigint): bigint {
  const blocks = BigInt(Math.ceil(THIRTY_DAYS_SECONDS / secondsPerBlock(chain)))
  return head > blocks ? head - blocks : 0n
}
