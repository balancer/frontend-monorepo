/**
 * Memoized viem PublicClient per chain. Uses a `fallback` transport so drpc
 * primary failures (5xx, rate limits) degrade to a public RPC rather than
 * failing the request outright. drpc API key is sourced from
 * `process.env.DRPC_API_KEY` via `getChainEndpoints` — never touched at the
 * call sites that consume this module.
 *
 * Concurrency: a `pLimit(4)` per chain caps in-flight fanouts triggered by
 * any single sync run. The route handler also dedupes in-flight requests
 * keyed on `(chain, pool)` so multiple page loads of the same pool collapse
 * to one RPC fan-out.
 */

import 'server-only'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import pLimit, { type LimitFunction } from 'p-limit'
import { createPublicClient, http, type Chain, type PublicClient } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  fraxtal,
  gnosis,
  hyperliquid,
  mainnet,
  mode,
  monad,
  optimism,
  plasma,
  polygon,
  sepolia,
  sonic,
} from 'viem/chains'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainEndpoints, isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'

// Canonical Multicall3 deployment address (CREATE2, identical on every
// chain that has it). Used to overlay a multicall3 address on chains
// where viem's bundled config doesn't include one (e.g. HyperEVM).
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

// HyperEVM ships in viem as `hyperliquid` but without a `contracts.multicall3`
// entry. We add it here so `client.multicall(...)` works; if Multicall3 isn't
// actually deployed at the canonical address on HyperEVM, individual calls
// fall back to per-call `eth_call` and the route handler swallows failures
// gracefully.
const hyperEvm: Chain = {
  ...hyperliquid,
  contracts: {
    ...(hyperliquid.contracts ?? {}),
    multicall3: { address: MULTICALL3_ADDRESS, blockCreated: 0 },
  },
}

// Maps `GqlChain` → viem `Chain`. Every entry needs `contracts.multicall3`
// set or `client.multicall(...)` throws "client chain not configured.
// multicallAddress is required.". When viem doesn't ship a chain (or ships
// it without multicall3 metadata) we either pull from a sibling source or
// overlay manually above.
const VIEM_CHAINS: Partial<Record<GqlChain, Chain>> = {
  [GqlChainValues.Mainnet]: mainnet,
  [GqlChainValues.Arbitrum]: arbitrum,
  [GqlChainValues.Avalanche]: avalanche,
  [GqlChainValues.Base]: base,
  [GqlChainValues.Fraxtal]: fraxtal,
  [GqlChainValues.Gnosis]: gnosis,
  [GqlChainValues.Hyperevm]: hyperEvm,
  [GqlChainValues.Mode]: mode,
  [GqlChainValues.Monad]: monad,
  [GqlChainValues.Optimism]: optimism,
  [GqlChainValues.Plasma]: plasma,
  [GqlChainValues.Polygon]: polygon,
  [GqlChainValues.Sepolia]: sepolia,
  [GqlChainValues.Sonic]: sonic,
}

const clientCache = new Map<GqlChain, PublicClient>()
const limitCache = new Map<GqlChain, LimitFunction>()

const PER_CHAIN_CONCURRENCY = 4

export class UnsupportedChainError extends Error {
  constructor(chain: GqlChain) {
    super(`drpc has no endpoint configured for chain ${chain}`)
    this.name = 'UnsupportedChainError'
  }
}

export function getPublicClient(chain: GqlChain): PublicClient {
  const cached = clientCache.get(chain)
  if (cached) return cached
  if (!isDrpcSupportedChain(chain)) throw new UnsupportedChainError(chain)

  // Surface a clear error before any network call. An empty key would
  // produce a malformed URL (e.g. `lb.drpc.live/ethereum/`) that drpc
  // rejects with 400 or 403 — not impossible to debug, just not obvious.
  if (!process.env.NEXT_PRIVATE_DRPC_KEY) {
    throw new Error(
      'NEXT_PRIVATE_DRPC_KEY is not set in this server process. Add it to ' +
        'apps/balancer-analytics/.env.local and restart `pnpm dev`. ' +
        'Next.js dev does not pick up env changes after start.'
    )
  }

  const { primary } = getChainEndpoints(chain)
  if (!primary) throw new UnsupportedChainError(chain)

  // Public-RPC fallback intentionally disabled during Phase B debugging:
  // viem's `fallback` transport silently swallows the primary error and
  // surfaces the secondary's, which hid a drpc auth issue under llamarpc's
  // 522 page. Restore once drpc is verified working end-to-end.
  const client = createPublicClient({
    chain: VIEM_CHAINS[chain],
    transport: http(primary, {
      retryCount: 2,
      retryDelay: 250,
      // 45s gives drpc room to chew through wide `eth_getLogs` calls on
      // pools with many indexed topics. The chunker auto-shrinks ranges on
      // timeout, so this is the upper-bound budget for a single chunk.
      timeout: 45_000,
    }),
  })
  clientCache.set(chain, client)
  return client
}

/**
 * p-limit gate scoped to one chain. Wrap fan-out work (e.g. parallel
 * `eth_getBlockByNumber` lookups across N unique blocks) with this so a
 * single sync can't overrun the per-chain RPS budget.
 */
export function getChainLimit(chain: GqlChain): LimitFunction {
  const cached = limitCache.get(chain)
  if (cached) return cached
  const limit = pLimit(PER_CHAIN_CONCURRENCY)
  limitCache.set(chain, limit)
  return limit
}
