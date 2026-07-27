import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { LabeledSwap } from './types'

/** Client-side window selector. Filters the server's 30d payload in-memory;
 *  never sent to the server. */
export type OrderFlowRange = '24h' | '7d' | '30d'

/** Response shape from `GET /api/pool/[chain]/[id]/order-flow`. Lives here
 *  (not in the route file) so both server and client can import it without
 *  pulling in the route's 'server-only' module.
 *
 *  The route always returns the full {@link FETCH_WINDOW_DAYS} window
 *  (30d). Range filtering is the client's job — the URL doesn't carry a
 *  `range` param so the CDN caches one payload per pool, regardless of
 *  which range the user is viewing.
 */
export type OrderFlowResponse = {
  pool: string
  chain: GqlChain
  /** Actual time bounds of the fetched payload. `oldestSwapTs` lets the
   *  client tell the user when the fetched dataset doesn't span the full
   *  30 days (typically because `totals.capped === true`). */
  fetchedWindow: {
    from: number
    to: number
    oldestSwapTs: number
    days: number
  }
  totals: {
    swapCount: number
    volumeUsd: number
    /** True if pagination hit `HARD_CAP` before reaching the cutoff. */
    capped: boolean
    /** True if api-v3 errored mid-pagination and we returned partial data. */
    truncated: boolean
  }
  /** Coverage over the full fetched window (not the client's current range). */
  coverage: {
    labeledUsd: number
    labeledPct: number
    unknownSenders: number
  }
  swaps: LabeledSwap[]
}
