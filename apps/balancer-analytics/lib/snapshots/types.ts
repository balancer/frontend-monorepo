import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

/**
 * Shape persisted by the cron-driven snapshotter.
 *
 * Top-level fields are the **CORE** series — `protocolMetricsAggregated` from
 * api-v3, which already includes CoW AMM in its numbers. `cowAmm` (when
 * present) is a *breakdown of* CORE for the same `(timestamp, chain)`, so
 * charts can split CoW AMM out as a stacked component. Never sum CORE + CoW
 * AMM — that double-counts.
 *
 * Source: `'api-v3'` rows come from the hourly cron. `'defillama'` rows come
 * from the one-shot historical backfill (only TVL / volume / fees are
 * populated; the other CORE fields are 0 on backfilled rows). `'mixed'` is
 * for the rare timestamp where the aggregate row and a per-chain row
 * disagree.
 */

export type SnapshotSource = 'api-v3' | 'defillama' | 'mixed'

export type ChainSnapshotPoint = {
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLiquidityProviders: number
}

export type CowAmmBreakdown = {
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  byChain: Partial<Record<GqlChain, ChainSnapshotPoint>>
}

export type ProtocolSnapshotPoint = {
  /** Unix seconds. Hour-aligned for cron rows; midnight-UTC-aligned for backfill rows. */
  timestamp: number
  /** Aggregated across all chains in the capture run (CORE). */
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLiquidityProviders: number
  /** Per-chain CORE breakdown. Sparse — chains absent at capture time are omitted. */
  byChain: Partial<Record<GqlChain, ChainSnapshotPoint>>
  /** CoW AMM breakdown for the same timestamp. Subset of CORE; not additive. */
  cowAmm?: CowAmmBreakdown
  /** Where this point came from. */
  source?: SnapshotSource
}

export type ProtocolSnapshotSeries = {
  /** Sorted by timestamp ascending. */
  points: ProtocolSnapshotPoint[]
  /** Reported by the loader so the UI can show a "last updated" hint. */
  generatedAt: number | null
}
