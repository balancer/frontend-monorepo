import { GqlChain, GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { isMetaStable, isStable, isWeighted, isGyro } from '../../../pool.helpers'
import { zeroAddress } from 'viem'

export enum RiskKey {
  General = 'general',
  Economic = 'economic-risk',
  ToxicToken = 'toxic-token-risk',
  RebaseToken = 'rebasing-tokens',
  Governance = 'governance-risk',
  FlashLoan = 'flash-loans-risk',
  JoinExit = 'join-exit-risk',
  ImpermanentLoss = 'impermanent-loss-risk',
  UI = 'ui-risk',
  Regulatory = 'regulatory-risk',
  PoolType = 'pool-type-risk',
  Oracle = 'oracles',
  Network = 'network-risks',
  Weighted = 'weighted-pools',
  Stable = 'stable-pools',
  ComposableStable = 'composable-pools',
  MetaStable = 'meta-stable-pools',
  Boosted = 'boosted-pools',
  Clp = 'concentrated-liquidity-pools',
  Arbitrum = 'arbitrum',
  Polygon = 'polygon',
  Zkevm = 'polygon-zkevm',
  Optimism = 'optimism',
  Gnosis = 'gnosis',
  Base = 'base',
  Avalanche = 'avalanche',
  Mutable = 'mutable-attributes-risk',
  Composability = 'composability-risk',
  RateProvider = 'rate-provider-risk',
  RateProviderBridge = 'rate-provider-bridges',
}

export const RISK_TITLES: Partial<Record<RiskKey, string>> = {
  [RiskKey.General]: 'General Balancer protocol risks',
  [RiskKey.Weighted]: 'Weighted pool risks',
  [RiskKey.Stable]: 'Stable pool risks',
  [RiskKey.ComposableStable]: 'Composable stable pool risks',
  [RiskKey.MetaStable]: 'MetaStable pool risks',
  [RiskKey.Boosted]: 'Boosted pool risks',
  [RiskKey.Clp]: 'Concentrated Liquidity pool risks',
  [RiskKey.Arbitrum]: 'L2 network risks: Arbitrum',
  [RiskKey.Polygon]: 'Sidechain network risks: Polygon',
  [RiskKey.Zkevm]: 'L2 network risks: Polygon zkEVM',
  [RiskKey.Optimism]: 'L2 network risks: Optimism',
  [RiskKey.Gnosis]: 'Sidechain network risks: Gnosis',
  [RiskKey.Base]: 'L2 network risks: Base',
  [RiskKey.Avalanche]: 'L1 network risks: Avalanche',
  [RiskKey.Mutable]: 'Mutable attributes risks',
  [RiskKey.Composability]: 'Composability risks',
  [RiskKey.RateProvider]: 'Rate provider risks',
  [RiskKey.RateProviderBridge]: 'Rate provider cross-chain bridge risks: Layer Zero',
}

export type Risk = {
  title: string
  path: string
}

function getLink(key: RiskKey, title?: string): Risk {
  return {
    title: title || RISK_TITLES[key] || `Unknown Risk Title - ${key}`,
    path: `/risks#${key}`,
  }
}

// Pool type risks
const weightedRisks = getLink(RiskKey.Weighted)
const stableRisks = getLink(RiskKey.Stable)
// const composableRisks = getLink(
//   RiskKey.ComposableStable,
//   // Explicit title because RiskKey.ComposableStable and RiskKey.MetaStable share the same key (hash)
//   'Composable Stable pool risks'
// )
const metaStableRisks = getLink(RiskKey.ComposableStable, RISK_TITLES[RiskKey.MetaStable])
// const boostedRisks = getLink(RiskKey.Boosted)
const clpRisks = getLink(RiskKey.Clp)
const arbitrumRisks = getLink(RiskKey.Arbitrum)
const polygonRisks = getLink(RiskKey.Polygon)
const zkevmRisks = getLink(RiskKey.Zkevm)
const optimismRisks = getLink(RiskKey.Optimism)
const gnosisRisks = getLink(RiskKey.Gnosis)
const baseRisks = getLink(RiskKey.Base)
const avalancheRisks = getLink(RiskKey.Avalanche)
const mutableRisks = getLink(RiskKey.Mutable)

export function getPoolRisks(pool: GqlPoolElement): Risk[] {
  const result: Risk[] = []

  if (isWeighted(pool.type)) result.push(weightedRisks)
  if (isStable(pool.type)) result.push(stableRisks)
  //   if (isComposableStable(pool.poolType)) result.push(composableRisks)
  if (isMetaStable(pool.type)) result.push(metaStableRisks)
  if (isGyro(pool.type)) result.push(clpRisks)
  //   if (isBoosted(pool)) {
  //     result.push(boostedRisks)
  //     const thirdPartyRisks = generateThirdPartyComposabilityRisks(pool)
  //     if (thirdPartyRisks) result.push(thirdPartyRisks)
  //   }

  if (pool.chain === GqlChain.Arbitrum) result.push(arbitrumRisks)
  if (pool.chain === GqlChain.Optimism) result.push(optimismRisks)
  if (pool.chain === GqlChain.Polygon) result.push(polygonRisks)
  if (pool.chain === GqlChain.Zkevm) result.push(zkevmRisks)
  if (pool.chain === GqlChain.Gnosis) result.push(gnosisRisks)
  if (pool.chain === GqlChain.Base) result.push(baseRisks)
  if (pool.chain === GqlChain.Avalanche) result.push(avalancheRisks)

  if (hasOwner(pool)) result.push(mutableRisks)

  result.push(getLink(RiskKey.General))

  return result
}

// export function generateThirdPartyComposabilityRisks(pool): Risk | undefined {
//   const protocols = boostedProtocols(pool)

//   if (protocols?.includes(Protocol.Tetu) || protocols?.includes(Protocol.Idle))
//     return getLink(
//       RiskKey.Composability,
//       'Third party DeFi composability risks: May use multiple yield protocols'
//     )

//   if (protocols?.includes(Protocol.Reaper)) protocols.push(Protocol.Granary)

//   if (protocols) {
//     return getLink(
//       RiskKey.Composability,
//       `Third party DeFi composability risks: ${protocols
//         .map(protocol => capitalize(protocol))
//         .join(', ')}`
//     )
//   }
// }

function hasOwner(pool: GqlPoolElement) {
  return !['', zeroAddress].includes(pool?.owner ? pool.owner.toString() : '')
}

export function risksTitle() {
  //   return `Liquidity Providers in this pool${alsoWhenSpecificRisks(pool)} face the following risks:`
  return `Liquidity providers in this pool face the following risks:`
}

// function alsoWhenSpecificRisks(pool: GqlPoolElement) {
//   if (poolSpecificRisks(pool).length > 0) return ' also'
//   return ''
// }

// TODO: should be pulled from API
// export function poolSpecificRisks(pool: GqlPoolElement): Risk[] {
//   const risks = POOLS?.Risks?.[pool.id.toLowerCase()]

//   if (risks) {
//     return risks.map(risk => getLink(risk))
//   }

//   return []
// }
