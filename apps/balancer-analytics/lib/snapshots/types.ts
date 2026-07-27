import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

/**
 * Shape persisted by the cron-driven snapshotter.
 *
 * Top-level fields are the **CORE** series — `protocolMetricsAggregated` from
 * api-v3 (forward) / `balancer-v2 + balancer-v3 + balancer-cow-amm` summed
 * from DefiLlama (historical). `breakdowns` carries the optional per-version
 * sub-series for the same `(timestamp, chain)` so charts can stack:
 *   - V2      — Balancer V2 alone
 *   - V3      — Balancer V3 alone
 *   - COW_AMM — Balancer CoW AMM alone
 *
 * Stacking V2 + V3 + COW_AMM approximates CORE. From DefiLlama backfill rows
 * they sum exactly (CORE was derived as the sum). From api-v3 cron rows
 * only COW_AMM is populated (no clean V2/V3 split available without BPT
 * double-counting), so the stack only renders for historical days.
 *
 * Source: `'api-v3'` rows come from the hourly cron. `'defillama'` rows come
 * from the one-shot historical backfill (only TVL / volume / fees populated;
 * the Balancer-specific fields are 0).
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

export type ProtocolBreakdown = {
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  byChain: Partial<Record<GqlChain, ChainSnapshotPoint>>
}

export type ProtocolKey = 'V2' | 'V3' | 'COW_AMM'

export type ProtocolSnapshotPoint = {
  /** Unix seconds. Hour-aligned for cron rows; midnight-UTC-aligned for backfill rows. */
  timestamp: number
  /** CORE aggregated across all chains (= V2 + V3 + COW_AMM for backfilled rows). */
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLiquidityProviders: number
  /** Per-chain CORE breakdown. Sparse — chains absent at capture time are omitted. */
  byChain: Partial<Record<GqlChain, ChainSnapshotPoint>>
  /** Optional per-version sub-series (V2 / V3 / COW_AMM). Always present for defillama rows, COW_AMM-only for api-v3 rows. */
  breakdowns?: Partial<Record<ProtocolKey, ProtocolBreakdown>>
  /** Where this point came from. */
  source?: SnapshotSource
}

export type ProtocolSnapshotSeries = {
  /** Sorted by timestamp ascending. */
  points: ProtocolSnapshotPoint[]
  /** Reported by the loader so the UI can show a "last updated" hint. */
  generatedAt: number | null
}
