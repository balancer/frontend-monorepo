import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'

const ORMI_BASE =
  'https://api.subgraph.ormilabs.com/api/public/717cf785-de57-4761-94dd-9ac51b019902/subgraphs'

// Chain → ormilabs slug. Chains absent from the map have no v3 vault subgraph
// available (Polygon, Mode, zkEVM, Fantom, Sonic, Fraxtal, Xlayer at the time
// of writing). Callers should treat absence as "no live state available".
export const V3_VAULT_SLUGS: Partial<Record<GqlChain, string>> = {
  [GqlChainValues.Mainnet]: 'v3-vault-mainnet-smol',
  [GqlChainValues.Arbitrum]: 'v3-vault-arbitrum-one-smol',
  [GqlChainValues.Avalanche]: 'v3-vault-avalanche-smol',
  [GqlChainValues.Base]: 'v3-vault-base-smol',
  [GqlChainValues.Gnosis]: 'v3-vault-gnosis-smol',
  [GqlChainValues.Hyperevm]: 'v3-vault-hyperevm-smol',
  [GqlChainValues.Monad]: 'v3-vault-monad-smol',
  [GqlChainValues.Optimism]: 'v3-vault-optimism-smol',
  [GqlChainValues.Plasma]: 'v3-vault-plasma-smol',
  [GqlChainValues.Sepolia]: 'v3-vault-sepolia-smol',
}

export function getV3VaultEndpoint(chain: GqlChain): string | null {
  const slug = V3_VAULT_SLUGS[chain]
  return slug ? `${ORMI_BASE}/${slug}/latest/gn` : null
}

export function getV3VaultSupportedChains(): GqlChain[] {
  return Object.keys(V3_VAULT_SLUGS) as GqlChain[]
}
