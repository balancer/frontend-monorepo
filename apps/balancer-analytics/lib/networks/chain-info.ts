/**
 * Single entry point for per-chain metadata in the analytics app.
 *
 * Two tiers of data live here:
 *
 *   1. **Shared** — anything the monorepo's `NetworkConfig` already exposes
 *      (block-explorer URL + name, chainId, native asset, multicall3, …)
 *      is sourced from `@repo/lib/config/networks/*.ts` via the helpers in
 *      `@repo/lib/shared/utils/blockExplorer` and `@repo/lib/config/app.config`.
 *      The analytics app previously hardcoded these in component-local
 *      `Record<string, string>` maps; they're re-exported here so the rest
 *      of the app has one import path and stays in lockstep with the
 *      monorepo when a chain's explorer URL changes (e.g. Monad's testnet
 *      explorer → Monadscan, or HyperEVM's Blockscout instance →
 *      HyperEVMscan).
 *
 *   2. **Analytics-local** — values the shared `NetworkConfig` does not
 *      carry. Block-time averages used for archive-block interpolation
 *      and event-log windowing belong here; they were previously
 *      duplicated across `pool-state/autorange-history.ts`,
 *      `pool-events/initial-cap.ts`, and `pool-events/sync.ts` with
 *      divergent values (Arbitrum 0.25 vs 0.26). The
 *      canonical map below is the one source of truth — callers pull
 *      `secondsPerBlock(chain)` so a tuning change touches one file.
 *
 * Anything else still local elsewhere (V3 helper-contract addresses,
 * subgraph slugs, chain brand colors, external-data CHAIN_MAPs) is
 * legitimately analytics-specific and stays where it is.
 */

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import {
  getBlockExplorerAddressUrl,
  getBlockExplorerBlockUrl,
  getBlockExplorerName,
  getBlockExplorerTokenUrl,
  getBlockExplorerTxUrl,
} from '@repo/lib/shared/utils/blockExplorer'
import { getChainId, getChainShortName } from '@repo/lib/config/app.config'

export {
  getBlockExplorerAddressUrl,
  getBlockExplorerBlockUrl,
  getBlockExplorerName,
  getBlockExplorerTokenUrl,
  getBlockExplorerTxUrl,
  getChainId,
  getChainShortName,
}

/**
 * Average block production interval in seconds per chain. Used by:
 *   - `pool-state/autorange-history.ts` to estimate historical block
 *     numbers from snapshot timestamps without a binary-search RPC dance
 *   - `pool-events/initial-cap.ts` to size the cold-floor scan window
 *   - `pool-events/sync.ts` to convert seconds-back into block-back when
 *     deriving the next event scan range
 *
 * Values are intentionally rounded — variance of ±10% is fine for daily
 * sampling, and chains with truly variable block times (e.g. Arbitrum
 * pre-Stylus) still produce a readable trajectory. Fallback is 12s
 * (Ethereum mainnet) for any chain not listed via {@link secondsPerBlock}.
 */
const SECONDS_PER_BLOCK: Partial<Record<GqlChain, number>> = {
  [GqlChainValues.Mainnet]: 12,
  [GqlChainValues.Sepolia]: 12,
  [GqlChainValues.Arbitrum]: 0.26,
  [GqlChainValues.Base]: 2,
  [GqlChainValues.Optimism]: 2,
  [GqlChainValues.Avalanche]: 2,
  [GqlChainValues.Polygon]: 2.2,
  [GqlChainValues.Gnosis]: 5,
  [GqlChainValues.Fraxtal]: 2,
  [GqlChainValues.Mode]: 2,
  [GqlChainValues.Sonic]: 0.4,
  [GqlChainValues.Fantom]: 1,
  [GqlChainValues.Xlayer]: 3,
  [GqlChainValues.Hyperevm]: 1,
  [GqlChainValues.Plasma]: 1,
  [GqlChainValues.Monad]: 0.5,
}

const DEFAULT_SECONDS_PER_BLOCK = 12

/** Average seconds per block on `chain`, falling back to Ethereum mainnet
 *  (12 s) for chains not listed. Always positive. */
export function secondsPerBlock(chain: GqlChain): number {
  return SECONDS_PER_BLOCK[chain] ?? DEFAULT_SECONDS_PER_BLOCK
}

/** Inverse of {@link secondsPerBlock}. Handy for sync.ts which thinks in
 *  blocks-per-second when paginating event-log scans. */
export function blocksPerSecond(chain: GqlChain): number {
  return 1 / secondsPerBlock(chain)
}
