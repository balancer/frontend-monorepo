/**
 * Decoded pool param event shape — what the route handler returns and what
 * the chart consumes.
 *
 * `args` is per-event-name and intentionally loose-typed here; the inspector
 * components narrow the shape at the call site using `event_name` as the
 * discriminator. Keeping the wire format flat (rather than a tagged union
 * over every event name) makes server→client serialization free.
 */

import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type PoolParamEvent = {
  chain: GqlChain
  poolAddress: string
  protocolVersion: 1 | 2 | 3
  blockNumber: number
  blockTimestamp: number
  logIndex: number
  txHash: string
  eventName: string
  args: Record<string, string | number | boolean>
}

export type PoolEventsResponse = {
  pool: string
  chain: GqlChain
  events: PoolParamEvent[]
  /** Last block scanned (head − 12). Clients can use this for incremental
   * "load newer" toggles, though the route handler is the authoritative
   * sync trigger. */
  lastBlock: number
  /** True when the route served the response without hitting drpc (TTL
   * cache hit). Surfaced for debugging / dashboards. */
  cached: boolean
}

export type PoolStateResponse = {
  pool: string
  chain: GqlChain
  /** Pool type from api-v3 (`WEIGHTED`, `STABLE`, ...). The state route
   * dispatches helper-contract reads off this value. */
  poolType: string | null
  protocolVersion: 1 | 2 | 3 | null
  /** Universal state. Always present when drpc is reachable. */
  universal: {
    swapFeePercentage: string | null
    aggregateSwapFeePercentage: string | null
    aggregateYieldFeePercentage: string | null
    isPaused: boolean | null
    isInRecoveryMode: boolean | null
  } | null
  /** Type-specific state. Shape varies by `poolType`. Phase A returns null. */
  typeSpecific: Record<string, unknown> | null
  /** Unix seconds when this snapshot was read. */
  fetchedAt: number
}
