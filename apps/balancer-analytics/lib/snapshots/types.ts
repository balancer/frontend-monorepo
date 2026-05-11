import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

/**
 * Shape persisted by the future cron-driven snapshotter.
 *
 * Why this exists: api-v3 exposes only point-in-time protocol metrics, not a
 * time series. Subgraphs (smol) deliberately don't ship snapshot entities and
 * their swap events lack USD values, so client-side aggregation isn't viable.
 * The plan (design doc §6 Tier 1) is to run a scheduled job that captures
 * `protocolMetricsAggregated` + `protocolMetricsChain` into a blob/object
 * store on a fixed cadence, and read that history from the app.
 *
 * Keeping this type in source ahead of the snapshotter so that:
 * - hooks can declare their final return shape today
 * - future implementers don't drift from a known contract
 * - readers can stub-replace the data source without UI churn
 */

export type ProtocolSnapshotPoint = {
  /** Unix seconds, hour-aligned (top of UTC hour) at capture. */
  timestamp: number
  /** Aggregated across all chains in the capture run. */
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLiquidityProviders: number
  /** Per-chain breakdown for the same timestamp. Sparse — chains absent on api-v3 at capture time are omitted. */
  byChain: Partial<Record<GqlChain, ChainSnapshotPoint>>
}

export type ChainSnapshotPoint = {
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLiquidityProviders: number
}

export type ProtocolSnapshotSeries = {
  /** Sorted by timestamp ascending. */
  points: ProtocolSnapshotPoint[]
  /** Reported by the loader so the UI can show a "last updated" hint. */
  generatedAt: number | null
}
