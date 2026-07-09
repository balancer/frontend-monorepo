/**
 * Pure normalizers for Dune query 3004790 rows.
 *
 * The Dune query exposes only (address, name, blockchain). We infer the
 * SourceCategory and a clean sourceId from `name` so the rest of the
 * label cascade can consume rows without knowing they came from Dune.
 *
 * Rules:
 *   - Categorization is by case-insensitive substring match on the name.
 *   - sourceId is a slugified form of the name with a small alias table
 *     for the most common brands, so Dune entries collapse into the same
 *     Sankey node as their `direct.ts` siblings (e.g. Dune "1Inch" + the
 *     handwritten "oneinch: AggregationRouterV6" both group under id "1inch").
 */

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import type { SourceCategory } from '@analytics/app/pool/[chain]/[id]/_components/PoolOrderFlow/types'

/** Dune blockchain string → our `GqlChain`. Unknown chains return null
 *  and the caller skips those rows. */
const CHAIN_MAP: Record<string, GqlChain> = {
  ethereum: GqlChainValues.Mainnet,
  arbitrum: GqlChainValues.Arbitrum,
  base: GqlChainValues.Base,
  optimism: GqlChainValues.Optimism,
  polygon: GqlChainValues.Polygon,
  gnosis: GqlChainValues.Gnosis,
  avalanche_c: GqlChainValues.Avalanche,
  avalanche: GqlChainValues.Avalanche,
  monad: GqlChainValues.Monad,
  fantom: GqlChainValues.Fantom,
  sonic: GqlChainValues.Sonic,
  fraxtal: GqlChainValues.Fraxtal,
  mode: GqlChainValues.Mode,
}

export function duneChainToGqlChain(blockchain: string): GqlChain | null {
  return CHAIN_MAP[blockchain.toLowerCase()] ?? null
}

/** Short brand id → keeps display crisp. The id is what the Sankey uses
 *  to group nodes; multiple addresses with the same id collapse into a
 *  single node. Matched substrings here win over the slug fallback. */
const NAME_TO_ID_ALIASES: Array<[RegExp, string]> = [
  [/^0x$/i, '0x'],
  [/^1inch$/i, '1inch'],
  [/^paraswap$/i, 'paraswap'],
  [/^li\.?fi$/i, 'lifi'],
  [/^dodo$/i, 'dodo'],
  [/^kyber$/i, 'kyber'],
  [/^odos$/i, 'odos'],
  [/^okx/i, 'okx'],
  [/^metamask$/i, 'metamask'],
  [/^socket$/i, 'socket'],
  [/^bungee$/i, 'bungee'],
  [/^squid$/i, 'squid'],
  [/^cowswap$/i, 'cowswap'],
  [/^uniswap\s*x$/i, 'uniswap-x'],
  [/^uniswap\s*v?2$/i, 'uniswap-v2'],
  [/^uniswap\s*v?3$/i, 'uniswap-v3'],
  [/^bebop$/i, 'bebop'],
  [/^hashflow$/i, 'hashflow'],
  [/^open\s*ocean$/i, 'openocean'],
  [/^lido$/i, 'lido'],
  [/^curve$/i, 'curve'],
  [/^sushi$/i, 'sushi'],
  [/^aerodrome$/i, 'aerodrome'],
  [/^traderjoe$/i, 'lfj'], // LFJ rebrand
  [/^lfj/i, 'lfj'],
  [/^aave$/i, 'aave'],
  [/^binance\s*router$/i, 'binance'],
  [/^magpie$/i, 'magpie'],
  [/^pendle$/i, 'pendle'],
  [/^maker$/i, 'maker'],
  [/^layerzero$/i, 'layerzero'],
  [/^stargate$/i, 'stargate'],
  [/^across$/i, 'across'],
  [/^synapse$/i, 'synapse'],
  [/^wormhole$/i, 'wormhole'],
  [/^relay$/i, 'relay'],
  [/^chainhop$/i, 'chainhop'],
  [/^interport$/i, 'interport'],
  [/^mux$/i, 'mux'],
  [/^gravity$/i, 'gravity'],
  [/^firebird$/i, 'firebird'],
  [/^slingshot$/i, 'slingshot'],
  [/^matcha$/i, '0x'], // Matcha is 0x's frontend
  [/mev/i, 'mev_bot'],
  [/arbitrage\s*bot/i, 'mev_bot'],
  [/searcher/i, 'mev_bot'],
  [/jared/i, 'mev_bot'],
  [/mm$|market\s*maker/i, 'mm'],
  [/^balancer/i, 'balancer'],
  [/^gnosis\s*safe$/i, 'safe'],
  [/^dsproxy$/i, 'dsproxy'],
  [/^direct\s*router$/i, 'direct-router'],
  [/^dexrouter$/i, 'dex-router'],
]

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '') || 'unknown'
  )
}

export function nameToSourceId(name: string): string {
  for (const [pattern, id] of NAME_TO_ID_ALIASES) {
    if (pattern.test(name)) return id
  }
  return slugify(name)
}

/** Categorize a Dune label by name. Defaults to 'aggregator' because the
 *  Dune list is "named contracts that touch DEXs" — any router-flavored
 *  entry is best modeled as an aggregator from the order-flow perspective
 *  even if the underlying protocol does more than routing. */
export function nameToCategory(name: string): SourceCategory {
  const n = name.toLowerCase().trim()

  // MEV — must come before generic routes, since some MEV bot names match
  // multiple patterns.
  if (/\bmev\b|arbitrage\s*bot|searcher|jared|flashbot/i.test(n)) return 'mev_bot'

  // Bridges
  const BRIDGE_NAMES = [
    'layerzero',
    'stargate',
    'across',
    'wormhole',
    'synapse',
    'hop',
    'celer',
    'chainhop',
    'interport',
    'mux',
    'gravity',
    'multichain',
    'relay',
    'squid',
    'debridge',
    'bungee',
    'socket',
  ]
  if (BRIDGE_NAMES.includes(n)) return 'bridge'

  // Intent venues (RFQ / batch auction protocols where solvers fill user intents)
  if (/^(cowswap|uniswap\s*x|bebop|hashflow|airswap|tokenlon)$/i.test(n)) {
    return 'intent'
  }

  // Market makers — usually have "MM" suffix or specific names
  if (/mm$|wintermute|janestreet|jane\s*street|flatmoneymm/i.test(n)) {
    return 'market_maker'
  }

  // Balancer's own routers
  if (n.startsWith('balancer')) return 'direct'

  // Default: aggregator covers DEX routers, DeFi protocols, wallet
  // routers — anything that brokers trade flow through Balancer pools.
  return 'aggregator'
}

export type NormalizedRow = {
  chain: GqlChain
  address: string
  sourceId: string
  name: string
  category: SourceCategory
}

/** Convert a raw Dune row into a normalized DB-shaped row. Returns null
 *  for unsupported chains or malformed addresses — caller filters. */
export function normalizeDuneRow(raw: {
  address?: unknown
  name?: unknown
  blockchain?: unknown
}): NormalizedRow | null {
  if (
    typeof raw.address !== 'string' ||
    typeof raw.name !== 'string' ||
    typeof raw.blockchain !== 'string'
  ) {
    return null
  }
  const chain = duneChainToGqlChain(raw.blockchain)
  if (!chain) return null
  const address = raw.address.toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(address)) return null
  return {
    chain,
    address,
    sourceId: nameToSourceId(raw.name),
    name: raw.name,
    category: nameToCategory(raw.name),
  }
}
