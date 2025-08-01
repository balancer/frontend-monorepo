import {
  GqlChain,
  GqlHookType,
  GqlPoolElement,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  isMetaStable,
  isStable,
  isWeighted,
  isGyro,
  isBoosted,
  hasNestedPools,
  hasHooks,
  hasHookType,
  isQuantAmmPool,
  isReclAmm,
  isV3LBP,
} from '../../../pool.helpers'
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
  HyperEVM = 'hyperevm',
  Mutable = 'mutable-attributes-risk',
  Composability = 'composability-risk',
  RateProvider = 'rate-provider-risk',
  RateProviderBridge = 'rate-provider-bridges',
  NestedPool = 'nested-pools',
  Hook = 'hooks-risk',
  StableSurgeHook = 'stablesurge-hook',
  MEVCaptureHook = 'mevcapture-hook',
  QuantAmmWeighted = 'btf',
  ReclAmm = 'reclamm',
  LiquidityBootstrappingPool = 'lbp',
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
  [RiskKey.HyperEVM]: 'L1 network risks: HyperEVM',
  [RiskKey.Mutable]: 'Mutable attributes risks',
  [RiskKey.Composability]: 'Composability risks',
  [RiskKey.RateProvider]: 'Rate provider risks',
  [RiskKey.RateProviderBridge]: 'Rate provider cross-chain bridge risks: Layer Zero',
  [RiskKey.NestedPool]: 'Nested pool risks',
  [RiskKey.Hook]: 'Hook risks',
  [RiskKey.StableSurgeHook]: 'StableSurge hook risks',
  [RiskKey.MEVCaptureHook]: 'MEV Capture hook risks',
  [RiskKey.QuantAmmWeighted]: 'BTF pool risks',
  [RiskKey.ReclAmm]: 'reCLAMM pool risks',
  [RiskKey.LiquidityBootstrappingPool]: 'Liquidity Bootstrapping pool risks',
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
const boostedRisks = getLink(RiskKey.Boosted)
const clpRisks = getLink(RiskKey.Clp)
const arbitrumRisks = getLink(RiskKey.Arbitrum)
const polygonRisks = getLink(RiskKey.Polygon)
const zkevmRisks = getLink(RiskKey.Zkevm)
const optimismRisks = getLink(RiskKey.Optimism)
const gnosisRisks = getLink(RiskKey.Gnosis)
const baseRisks = getLink(RiskKey.Base)
const avalancheRisks = getLink(RiskKey.Avalanche)
const hyperEvmRisks = getLink(RiskKey.HyperEVM)
const mutableRisks = getLink(RiskKey.Mutable)
const nestedPoolRisks = getLink(RiskKey.NestedPool)
const hookRisks = getLink(RiskKey.Hook)
const stableSurgeHookRisks = getLink(RiskKey.StableSurgeHook)
const mevCaptureHookRisks = getLink(RiskKey.MEVCaptureHook)
const quantAmmWeightedRisks = getLink(RiskKey.QuantAmmWeighted)
const reclAmmRisks = getLink(RiskKey.ReclAmm)
const liquidityBootstrappingPoolRisks = getLink(RiskKey.LiquidityBootstrappingPool)

export function getPoolRisks(pool: GqlPoolElement): Risk[] {
  const result: Risk[] = []

  if (isWeighted(pool.type)) result.push(weightedRisks)
  if (isStable(pool.type)) result.push(stableRisks)
  //   if (isComposableStable(pool.poolType)) result.push(composableRisks)
  if (isMetaStable(pool.type)) result.push(metaStableRisks)
  if (isGyro(pool.type)) result.push(clpRisks)
  if (isBoosted(pool)) result.push(boostedRisks)
  if (isQuantAmmPool(pool.type)) result.push(quantAmmWeightedRisks)
  if (isReclAmm(pool.type)) result.push(reclAmmRisks)
  if (isV3LBP(pool)) result.push(liquidityBootstrappingPoolRisks)
  if (pool.chain === GqlChain.Arbitrum) result.push(arbitrumRisks)
  if (pool.chain === GqlChain.Optimism) result.push(optimismRisks)
  if (pool.chain === GqlChain.Polygon) result.push(polygonRisks)
  if (pool.chain === GqlChain.Zkevm) result.push(zkevmRisks)
  if (pool.chain === GqlChain.Gnosis) result.push(gnosisRisks)
  if (pool.chain === GqlChain.Base) result.push(baseRisks)
  if (pool.chain === GqlChain.Avalanche) result.push(avalancheRisks)
  if (pool.chain === GqlChain.Hyperevm) result.push(hyperEvmRisks)
  if (hasNestedPools(pool)) result.push(nestedPoolRisks)
  if (hasHooks(pool)) result.push(hookRisks)
  if (hasHookType(pool, GqlHookType.StableSurge)) result.push(stableSurgeHookRisks)
  if (hasHookType(pool, GqlHookType.MevTax)) result.push(mevCaptureHookRisks)
  if (isMutable(pool)) result.push(mutableRisks)

  result.push(getLink(RiskKey.General))

  return result
}

function isMutable(pool: GqlPoolElement) {
  return (
    !isEmpty(pool.swapFeeManager || '') ||
    !isEmpty(pool.pauseManager || '') ||
    !isEmpty(pool.poolCreator || '')
  )
}

function isEmpty(address: string) {
  return ['', zeroAddress].includes(address)
}

export function risksTitle() {
  return `Liquidity providers in this pool face the following risks:`
}
