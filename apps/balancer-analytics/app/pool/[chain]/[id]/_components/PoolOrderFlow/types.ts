import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type SourceCategory =
  | 'aggregator'
  | 'intent'
  | 'direct'
  | 'mev_bot'
  | 'market_maker'
  | 'bridge'
  | 'unknown'

export type SourceLabel = {
  /** Stable grouping key. Multiple addresses can share an id (e.g. paraswap v6 + v6_1).
   *  The Sankey aggregates source nodes by this id. */
  id: string
  /** Display name (Etherscan-style: "paraswap: AugustusV6"). Shown in tooltips. */
  name: string
  /** Broad bucket used for legend grouping and node coloring. */
  category: SourceCategory
}

export type LabeledSwap = {
  id: string
  timestamp: number
  tx: string
  valueUSD: number
  sender: string
  tokenIn: { address: string; amount: string }
  tokenOut: { address: string; amount: string }
  source: SourceLabel
}

/** Address → label dict, per chain. All address keys are lowercased. */
export type LabelsByChain = Partial<Record<GqlChain, Record<string, SourceLabel>>>
