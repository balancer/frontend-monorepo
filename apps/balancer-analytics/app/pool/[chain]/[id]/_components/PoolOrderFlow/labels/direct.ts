/**
 * Direct address → SourceLabel dictionary.
 *
 * Seed list pulled from a Dune labels query (aggregators, Balancer direct
 * routers, MEV bots). CowSwap GPv2 Settlement and two MEV bots identified
 * via the in-repo `scripts/probe-swap-sources.mjs` are added on top.
 *
 * Address keys are lowercased. Multiple addresses can share an `id` —
 * the Sankey collapses them into a single source node (e.g. all paraswap
 * versions render as one "paraswap" node, all MEV bots as one "MEV bots"
 * node) while tooltips preserve the specific contract name.
 *
 * Add a new entry by appending to the chain's map. To find candidates,
 * re-run `node apps/balancer-analytics/scripts/probe-swap-sources.mjs`
 * against a high-volume pool and inspect the top "(unlabeled)" rows.
 */

import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import type { LabelsByChain } from '../types'

type MainnetLabel = {
  id: string
  name: string
  category: 'aggregator' | 'intent' | 'direct' | 'mev_bot' | 'market_maker' | 'bridge'
}

const MAINNET: Record<string, MainnetLabel> = {
  // ── Aggregators ────────────────────────────────────────────────────────
  '0x0000000000001ff3684f28c67538d4d072c22734': { id: '0x',         name: 'zeroex: AllowanceHolder',          category: 'aggregator' },
  '0x07e594aa718bb872b526e93eed830a8d2a6a1071': { id: '0x',         name: 'zeroex: MainnetSettler',           category: 'aggregator' },
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { id: '0x',         name: 'zeroex: ExchangeProxy',            category: 'aggregator' },
  '0xe66b31678d6c16e9ebf358268a790b763c133750': { id: '0x',         name: 'zeroex: ZeroExProxy',              category: 'aggregator' },

  '0x111111125421ca6dc452d289314280a0f8842a65': { id: '1inch',      name: 'oneinch: AggregationRouterV6',     category: 'aggregator' },
  '0x11111112542d85b3ef69ae05771c2dccff4faa26': { id: '1inch',      name: 'oneinch: AggregationRouterV3',     category: 'aggregator' },
  '0x1111111254eeb25477b68fb85ed929f73a960582': { id: '1inch',      name: 'oneinch: AggregationRouterV5',     category: 'aggregator' },
  '0x1111111254fb6c44bac0bed2854e76f90643097d': { id: '1inch',      name: 'oneinch: AggregationRouterV4',     category: 'aggregator' },
  '0xa88800cd213da5ae406ce248380802bd53b47647': { id: '1inch',      name: 'oneinch: Settlement',              category: 'aggregator' },
  '0xb01f8f528702d411d24c9bb8cc0e2fff779ec013': { id: '1inch',      name: 'oneinch: LeftoverExchangerV1',     category: 'aggregator' },
  '0xdd9f24efc84d93deef3c8745c837ab63e80abd27': { id: '1inch',      name: 'oneinch: GovLeftoverExchanger',    category: 'aggregator' },

  '0x00000000fdac7708d0d360bddc1bc7d097f47439': { id: 'paraswap',   name: 'paraswap: AugustusV6',             category: 'aggregator' },
  '0x000db803a70511e09da650d4c0506d0000100000': { id: 'paraswap',   name: 'paraswap: AugustusV6_1',           category: 'aggregator' },
  '0x6a000f20005980200259b80c5102003040001068': { id: 'paraswap',   name: 'paraswap: AugustusV6_2',           category: 'aggregator' },
  '0x135896de8421be2ec868e0b811006171d9df802a': { id: 'paraswap',   name: 'paraswap: LiquiditySwapAdapter',   category: 'aggregator' },
  '0x80aca0c645fedabaa20fd2bf0daf57885a309fe6': { id: 'paraswap',   name: 'paraswap: RepayAdapter',           category: 'aggregator' },
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57': { id: 'paraswap',   name: 'paraswap: AugustusSwapper6.0',     category: 'aggregator' },

  '0x21b9f852534fb9ddc3a0a7b24f067b50d8ac9a99': { id: 'dodo',       name: 'dodo: DODOFeeRouteProxy',          category: 'aggregator' },
  '0x50f9bde1c76bba997a5d6e7fefff695ec8536194': { id: 'dodo',       name: 'dodo: DODOFeeRouteProxy',          category: 'aggregator' },
  '0xa2398842f37465f89540430bdc00219fa9e4d28a': { id: 'dodo',       name: 'dodo: DODORouteProxy',             category: 'aggregator' },
  '0xa356867fdcea8e71aeaf87805808803806231fdc': { id: 'dodo',       name: 'dodo: DODOV2Proxy02',              category: 'aggregator' },
  '0xd9b825d16e09f28d0c715fe004364046e5524dbb': { id: 'dodo',       name: 'dodo: LimitOrderBot',              category: 'aggregator' },
  '0xfe837a3530dd566401d35befcd55582af7c4dffc': { id: 'dodo',       name: 'dodo: DODOFeeRouteProxy',          category: 'aggregator' },

  '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae': { id: 'lifi',       name: 'lifi: LiFiDiamond_v2',             category: 'aggregator' },
  '0x6307119078556fc8ad77781dfc67df20d75fb4f9': { id: 'lifi',       name: 'lifi: Permit2Proxy',               category: 'aggregator' },
  '0x9b11bc9fac17c058cab6286b0c785be6a65492ef': { id: 'lifi',       name: 'lifi: LiFiDiamondImmutable',       category: 'aggregator' },

  '0x28b1dc1a5e3699a428bc51d234dfab7c9cb2a183': { id: 'okx',        name: 'okx_dex_v4: DexRouter',            category: 'aggregator' },
  '0x7d0ccaa3fac1e5a943c5168b6ced828691b46b36': { id: 'okx',        name: 'okx: DexRouter',                   category: 'aggregator' },
  '0xf3de3c0d654fda23dad170f0f320a92172509127': { id: 'okx',        name: 'okx: DexRouter',                   category: 'aggregator' },
  '0xfc99f58a8974a4bc36e60e2d490bb8d72899ee9f': { id: 'okx',        name: 'okx: BridgeRouter',                category: 'aggregator' },

  '0x0f26b03961eb5d625bd6001278f0db13f3e583d8': { id: 'odos',       name: 'odos_v2: LimitOrderRouter',        category: 'aggregator' },
  '0xcf5540fffcdc3d510b18bfca6d2b9987b0772559': { id: 'odos',       name: 'odos_v2: OdosRouterV2',            category: 'aggregator' },

  '0x0439e60f02a8900a951603950d8d4527f400c3f1': { id: 'metamask',   name: 'metamask: MetaBridge',             category: 'aggregator' },
  '0x881d40237659c251811cec9c364ef91dc08d300c': { id: 'metamask',   name: 'metamask: MetaSwap',               category: 'aggregator' },

  '0x5e2361cd711de7efe2a85045b643271a64262d40': { id: 'socket',     name: 'socket: FeeRouter',                category: 'aggregator' },
  '0xc30141b657f4216252dc59af2e7cdb9d8792e1b0': { id: 'socket',     name: 'socket: Registry',                 category: 'aggregator' },

  '0x663dc15d3c1ac63ff12e45ab68fea3f0a883c251': { id: 'debridge',   name: 'debridge: DeSwapSender',           category: 'aggregator' },
  '0xe7351fd770a37282b91d153ee690b63579d6dd7f': { id: 'debridge',   name: 'debridge: DlnDestination',         category: 'aggregator' },

  '0x0736bdc975af0675b9a045384efed91360d25479': { id: 'aori',       name: 'aori',                             category: 'aggregator' },
  '0x4d9cdb3f367a93ef942f1564fee5e58d2b68220e': { id: 'swing',      name: 'swing: SwitchV2',                  category: 'aggregator' },
  '0xae68b7117be0026cbd4366303f74eecbb19e4042': { id: 'bungee',     name: 'bungee: Solver',                   category: 'aggregator' },
  '0xb300000b72deaeb607a12d5f54773d1c19c7028d': { id: 'binance',    name: 'Binance DEX Aggregator',           category: 'aggregator' },
  '0xce16f69375520ab01377ce7b88f5ba8c48f8d666': { id: 'squid',      name: 'squid_router: SquidRouter',        category: 'aggregator' },
  '0x00000000009726632680fb29d3f7a9734e3010e2': { id: 'rainbow',    name: 'rainbow_swap_aggregator',          category: 'aggregator' },

  // ── Intent venues ──────────────────────────────────────────────────────
  // Added manually — not in the Dune export. CowSwap routes solver fills
  // through the GPv2 Settlement contract, which appears as `sender` on
  // any Balancer V3 pool that participates in a CowSwap batch.
  '0x9008d19f58aabd9ed0d60971565aa8510560ab41': { id: 'cowswap',    name: 'cowswap: GPv2Settlement',          category: 'intent' },

  // ── Balancer direct routers ────────────────────────────────────────────
  // User went straight through a Balancer router (UI or SDK) with no
  // aggregator wrapping. Collapses to a single "Balancer direct" node.
  '0x136f1efcc3f8f88516b9e94110d56fdbfb1778d1': { id: 'balancer',   name: 'balancer_v3: BatchRouter',         category: 'direct' },
  '0x3e66b66fd1d0b02fda6c811da9e0547970db2f21': { id: 'balancer',   name: 'balancer_v2: ExchangeProxy',       category: 'direct' },
  '0x5c6fb490bdfd3246eb0bb062c168decaf4bd9fdd': { id: 'balancer',   name: 'balancer_v3: Router',              category: 'direct' },
  '0xae563e3f8219521950555f5962419c8919758ea2': { id: 'balancer',   name: 'balancer_v3: Router',              category: 'direct' },
  '0xba12222222228d8ba445958a75a0704d566bf2c8': { id: 'balancer',   name: 'balancer_v2: Vault',               category: 'direct' },

  // ── MEV bots ───────────────────────────────────────────────────────────
  // Roll all of these into one "MEV" Sankey node (single id) but preserve
  // the specific name in `name` for tooltips. Curate as new ones surface
  // via the probe script.
  '0x000000000035b5e5ad9019092c665357240f594e': { id: 'mev_bot',    name: 'MEV bot 0x0000…594E',              category: 'mev_bot' },
  '0x00c21ca82d94dade0d5d1ed420a4728f58427d21': { id: 'mev_bot',    name: 'MEV bot 0x00C2…7D21',              category: 'mev_bot' },
  '0x01fdc48ba0903bb1ae7c517c9287d88ea236f8e1': { id: 'mev_bot',    name: 'MEV bot 0x01FD…F8E1',              category: 'mev_bot' },
  '0x1f2f10d1c40777ae1da742455c65828ff36df387': { id: 'mev_bot',    name: 'jaredfromsubway #2',               category: 'mev_bot' },
  '0xa0f1c3ad83e07d97b5e7030e177718be175275ea': { id: 'mev_bot',    name: 'MEV-funded EOA 0xA0F1…75EA',       category: 'mev_bot' },
  '0xd8349e874934593c85eafa8e534b495d80848e41': { id: 'mev_bot',    name: 'MEV-interacting EOA 0xD834…8E41',  category: 'mev_bot' },
  '0xe00456d3af6e9b8715a9c29c88c1932983e064c1': { id: 'mev_bot',    name: 'MEV-funded EOA 0xE004…64C1',       category: 'mev_bot' },

  // MEV bots identified via `scripts/probe-swap-sources.mjs` against the
  // GHO/USDT/USDC pool — together ~52% of that pool's 7d volume.
  '0x654fae4aa229d104cabead47e56703f58b174be4': { id: 'mev_bot',    name: 'MEV bot 0x654f…4be4',              category: 'mev_bot' },
  '0xae2fc483527b8ef99eb5d9b44875f005ba1fae13': { id: 'mev_bot',    name: 'MEV bot 0xae2f…fae13',             category: 'mev_bot' },

  // MEV bot identified on the rETH/Aave WETH pool ($657k across 9 swaps).
  '0xa0b1c5f88d9a1acdd4f7ff869e947bfd54c07c61': { id: 'mev_bot',    name: 'MEV bot 0xa0b1…7c61',              category: 'mev_bot' },

  // ── Market makers ──────────────────────────────────────────────────────
  // Private liquidity providers / institutional MMs. Distinct from
  // aggregators (which aggregate multiple sources) — these are direct
  // counterparties offering quotes.
  '0xbee018a99073a0d838d2412add382db3af711005': { id: 'mm',         name: 'Market maker 0xbee0…1005',         category: 'market_maker' },
  '0xbee4b69f6821ee7196182788392ff188bac99011': { id: 'mm',         name: 'Market maker 0xbee4…9011',         category: 'market_maker' },

  // ── Additional 1inch routers/solvers ──────────────────────────────────
  // Spotted as tx.to on real swaps; share the '1inch' id so they collapse
  // into the same Sankey node as the other 1inch entries.
  '0x7b49bc3ebbdf7322f31c6449320382bbec3be1b6': { id: '1inch',      name: 'oneinch: router 0x7b49…e1b6',      category: 'aggregator' },
  '0x70e59f9c304e4d5096bd408b571e2dcd99c3120b': { id: '1inch',      name: 'oneinch: router 0x70e5…120b',      category: 'aggregator' },
  '0xe99bd1c2dd70cd58e5efd47887991700e7318ce2': { id: '1inch',      name: 'oneinch: router 0xe99b…8ce2',      category: 'aggregator' },
}

type MonadLabel = {
  id: string
  name: string
  category: 'aggregator' | 'mev_bot' | 'bridge'
}

const MONAD: Record<string, MonadLabel> = {
  // MEV / Flashbots-style searcher contract.
  '0x22c6a8b73641e9a1e8066a01c71c388e52230659': { id: 'mev_bot', name: 'MEV bot / flashbot 0x22c6…0659', category: 'mev_bot' },
  // Across protocol bridge — heavy interaction with Across infra.
  '0xcad97616f91872c02ba3553db315db4015cbe850': { id: 'across',  name: 'Across bridge 0xcad9…e850',     category: 'bridge' },
  // LFJ (Trader Joe) — LB Router + Joe Aggregator transactions on Monad.
  '0x086ff8a909b3082b07541bb50a41a61168e26538': { id: 'lfj',     name: 'LFJ aggregator 0x086f…6538',    category: 'aggregator' },
}

export const DIRECT_LABELS: LabelsByChain = {
  [GqlChainValues.Mainnet]: MAINNET,
  [GqlChainValues.Monad]: MONAD,
}
