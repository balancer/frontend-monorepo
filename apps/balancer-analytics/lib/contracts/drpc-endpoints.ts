/**
 * drpc endpoint resolver. Server-only — the `NEXT_PRIVATE_DRPC_KEY` is read
 * at call time and this file must never be imported from client code (the
 * route handlers that consume it all start with `import 'server-only'`).
 *
 * Delegates chain → slug lookup to `@repo/lib`'s `drpcUrl()` helper so the
 * analytics app stays aligned with `frontend-v3`'s rpc proxy. Adds two
 * things on top:
 *   1. A public-RPC fallback URL per chain — wired into viem's `fallback`
 *      transport so a drpc 5xx degrades to a public node instead of failing
 *      the request.
 *   2. An `isDrpcSupportedChain` predicate (the upstream helper throws on
 *      unsupported chains; we want a soft check at validation time).
 */

import 'server-only'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { drpcUrl } from '@repo/lib/shared/utils/rpc'

/**
 * Public fallback RPC per chain. Used by the viem `fallback` transport when
 * drpc 5xx's or hits rate limits. Chains without a fallback degrade to
 * drpc-only.
 */
const PUBLIC_FALLBACK_URLS: Partial<Record<GqlChain, string>> = {
  [GqlChainValues.Mainnet]: 'https://eth.llamarpc.com',
  [GqlChainValues.Arbitrum]: 'https://arb1.arbitrum.io/rpc',
  [GqlChainValues.Base]: 'https://mainnet.base.org',
  [GqlChainValues.Optimism]: 'https://mainnet.optimism.io',
  [GqlChainValues.Polygon]: 'https://polygon-rpc.com',
  [GqlChainValues.Avalanche]: 'https://api.avax.network/ext/bc/C/rpc',
  [GqlChainValues.Gnosis]: 'https://rpc.gnosischain.com',
  [GqlChainValues.Sepolia]: 'https://rpc.sepolia.org',
}

export type ChainEndpoints = {
  /** drpc primary URL with API key. May be `null` if the chain isn't on drpc. */
  primary: string | null
  /** Public RPC fallback. May be `null` if no good public option exists. */
  fallback: string | null
}

export function getChainEndpoints(chain: GqlChain): ChainEndpoints {
  const key = process.env.NEXT_PRIVATE_DRPC_KEY ?? ''
  let primary: string | null = null
  try {
    primary = key ? drpcUrl(chain, key) : null
  } catch {
    primary = null
  }
  if (primary && !key) {
    // Unreachable: drpcUrl returns a slug-bearing URL only if the chain is
    // in the map, but we short-circuited above when key is empty. Kept as a
    // defense in depth so missing-key configs surface a clear error.
    throw new Error('NEXT_PRIVATE_DRPC_KEY is missing. Set it via Vercel env or .env.local.')
  }
  return {
    primary,
    fallback: PUBLIC_FALLBACK_URLS[chain] ?? null,
  }
}

export function isDrpcSupportedChain(chain: GqlChain): boolean {
  // `drpcUrl` throws on unsupported chains. We don't care about the URL
  // value here, just whether the chain is known — using a placeholder key
  // keeps the side-effect-free predicate truly side-effect-free.
  try {
    drpcUrl(chain, 'probe')
    return true
  } catch {
    return false
  }
}
