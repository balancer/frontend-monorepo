/**
 * V3 helper-contract addresses per chain.
 *
 * `VaultExplorer` and `ProtocolFeeController` are deployed once per chain
 * (addresses differ from the Vault's CREATE2 constant). Addresses come from
 * `balancer/balancer-deployments` → `addresses/<chain>.json`.
 *
 * Missing entries are treated as "helper read unavailable" by every
 * consumer (`runSync`, `readUniversalV3State`, etc.), so the page still
 * renders the chart + event timeline from log-derived data — only the
 * universal-state panel and the Filter A address list degrade.
 *
 * Active deployment tasks (verified on `balancer-deployments`):
 *   - VaultExplorer v2:        20250407-v3-vault-explorer-v2
 *   - ProtocolFeeController v2: 20250214-v3-protocol-fee-controller-v2
 *   - StableSurgeHook v2:       20250403-v3-stable-surge-hook-v2  (active)
 *   - StableSurgeHook (legacy): 20250121-v3-stable-surge          (older pools, mainnet/base/arbitrum/gnosis only)
 *
 * The surge hook list keeps the legacy address on the chains where it was
 * deployed because pools registered with v1 still emit events from that
 * contract; the log filter passes both addresses in the same
 * `eth_getLogs` call.
 *
 * Chain coverage notes:
 *   - **Polygon, Fraxtal, Mode, ZkEVM**: api-v3 reports zero V3 pools — V3
 *     not deployed there. Intentionally absent from the map.
 *   - **Sonic**: V3 IS live (147 pools per api-v3, canonical V3 vault
 *     bytecode present on-chain) but **two** blockers prevent shipping:
 *       (1) `balancer-deployments` has not catalogued the helper
 *           addresses for Sonic (no `addresses/sonic.json`).
 *       (2) Sonic is not in `PROJECT_CONFIG.supportedNetworks`
 *           (`packages/lib/config/projects/balancer.ts`), so the page
 *           route rejects it with a 404 regardless. Both upstream
 *           additions are needed before Sonic pools can be browsed here.
 */

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import type { Address } from 'viem'

export type V3HelperAddresses = {
  vaultExplorer: Address | null
  protocolFeeController: Address | null
  /** All StableSurgeHook deployments — events filtered across the union.
   *  Order doesn't matter; first address is conventionally the active one. */
  stableSurgeHooks: readonly Address[]
}

export const V3_HELPER_ADDRESSES: Partial<Record<GqlChain, V3HelperAddresses>> = {
  [GqlChainValues.Mainnet]: {
    vaultExplorer: '0xFc2986feAB34713E659da84F3B1FA32c1da95832',
    protocolFeeController: '0x212F884252792ebaaA811FB0678444b21c7C2879',
    stableSurgeHooks: [
      '0xBDbADc891BB95DEE80eBC491699228EF0f7D6fF1', // v2 (active)
      '0xb18fA0cb5DE8cecB8899AAE6e38b1B7ed77885dA', // v1 (legacy — older pools)
    ],
  },
  [GqlChainValues.Base]: {
    vaultExplorer: '0xaD89051bEd8d96f045E8912aE1672c6C0bF8a85E',
    protocolFeeController: '0x2FF226CD12C80511a641A6101F071d853A4e5363',
    stableSurgeHooks: [
      '0xDB8d758BCb971e482B2C45f7F8a7740283A1bd3A',
      '0xb2007B8B7E0260042517f635CFd8E6dD2Dd7f007',
    ],
  },
  [GqlChainValues.Arbitrum]: {
    vaultExplorer: '0xB9d01CA61b9C181dA1051bFDd28e1097e920AB14',
    protocolFeeController: '0x4638ab64022927C9bD5947607459D13f57f1551C',
    stableSurgeHooks: [
      '0x7c1b7A97BfAcD39975dE53e989A16c7BC4C78275',
      '0x0Fa0f9990D7969a7aE6f9961d663E4A201Ed6417',
    ],
  },
  [GqlChainValues.Optimism]: {
    vaultExplorer: '0xEAedc32a51c510d35ebC11088fD5fF2b47aACF2E',
    protocolFeeController: '0xCaCC7E1efEEA8BB3af6d5720d12C1876aa6EE76b',
    stableSurgeHooks: ['0xF39CA6ede9BF7820a952b52f3c94af526bAB9015'],
  },
  [GqlChainValues.Gnosis]: {
    vaultExplorer: '0x7f4C133e44381D05129F9B81bAD8Fa9F3345D29B',
    protocolFeeController: '0xa7d524046ef89de9F8e4f2d7B029f66cCB738d48',
    stableSurgeHooks: [
      '0x90BD26fbb9dB17D75b56E4cA3A4c438FA7C93694',
      '0xe4f1878eC9710846E2B529C1b5037F8bA94583b1',
    ],
  },
  [GqlChainValues.Avalanche]: {
    vaultExplorer: '0x4Cb42fc3b5fb9392Ce0772C3A540E4AE4da4Ac4d',
    protocolFeeController: '0x3630D26E51c03026f4f063d69d65F8E234eEAf5b',
    stableSurgeHooks: ['0x86705Ee19c0509Ff68F1118C55ee2ebdE383D122'],
  },
  // ── Chains added 2026-05-20 (handoff §12 #5) ─────────────────────────
  // Plasma and Monad share addresses (default CREATE2-style deployer
  // inputs); HyperEVM uses chain-specific addresses. None carry the legacy
  // StableSurgeHook v1 (those chains came online after the v2 cutover).
  // Confirmed on-chain: HyperEVM VaultExplorer.getVault() → canonical V3
  // vault `0xbA1333…ba9`.
  [GqlChainValues.Plasma]: {
    vaultExplorer: '0x043A2daD730d585C44FB79D2614F295D2d625412',
    protocolFeeController: '0xCaCC7E1efEEA8BB3af6d5720d12C1876aa6EE76b',
    stableSurgeHooks: ['0x6817149cb753BF529565B4D023d7507eD2ff4Bc0'],
  },
  [GqlChainValues.Monad]: {
    vaultExplorer: '0x043A2daD730d585C44FB79D2614F295D2d625412',
    protocolFeeController: '0xCaCC7E1efEEA8BB3af6d5720d12C1876aa6EE76b',
    stableSurgeHooks: ['0x6817149cb753BF529565B4D023d7507eD2ff4Bc0'],
  },
  [GqlChainValues.Hyperevm]: {
    vaultExplorer: '0x4bdCc2fb18AEb9e2d281b0278D946445070EAda7',
    protocolFeeController: '0xCaCC7E1efEEA8BB3af6d5720d12C1876aa6EE76b',
    stableSurgeHooks: ['0x5DbAd78818D4c8958EfF2d5b95b28385A22113Cd'],
  },
}

export function getV3HelperAddresses(chain: GqlChain): V3HelperAddresses | null {
  return V3_HELPER_ADDRESSES[chain] ?? null
}
