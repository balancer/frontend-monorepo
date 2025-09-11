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
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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
  [RiskKey.General]: `General ${PROJECT_CONFIG.projectName} protocol risks`,
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
  title: string | undefined
  path: string
}

export interface RiskDefinition {
  key: RiskKey
  title: string | undefined
  path: string
  condition: (pool: GqlPoolElement) => boolean
}

// Risk condition definitions
const RISK_CONDITIONS: RiskDefinition[] = [
  {
    key: RiskKey.Weighted,
    title: RISK_TITLES[RiskKey.Weighted],
    path: `/risks#${RiskKey.Weighted}`,
    condition: pool => isWeighted(pool.type),
  },
  {
    key: RiskKey.Stable,
    title: RISK_TITLES[RiskKey.Stable],
    path: `/risks#${RiskKey.Stable}`,
    condition: pool => isStable(pool.type),
  },
  {
    key: RiskKey.MetaStable,
    title: RISK_TITLES[RiskKey.MetaStable],
    path: `/risks#${RiskKey.MetaStable}`,
    condition: pool => isMetaStable(pool.type),
  },
  {
    key: RiskKey.Clp,
    title: RISK_TITLES[RiskKey.Clp],
    path: `/risks#${RiskKey.Clp}`,
    condition: pool => isGyro(pool.type),
  },
  {
    key: RiskKey.Boosted,
    title: RISK_TITLES[RiskKey.Boosted],
    path: `/risks#${RiskKey.Boosted}`,
    condition: pool => !!isBoosted(pool),
  },
  {
    key: RiskKey.QuantAmmWeighted,
    title: RISK_TITLES[RiskKey.QuantAmmWeighted],
    path: `/risks#${RiskKey.QuantAmmWeighted}`,
    condition: pool => isQuantAmmPool(pool.type),
  },
  {
    key: RiskKey.ReclAmm,
    title: RISK_TITLES[RiskKey.ReclAmm],
    path: `/risks#${RiskKey.ReclAmm}`,
    condition: pool => isReclAmm(pool.type),
  },
  {
    key: RiskKey.LiquidityBootstrappingPool,
    title: RISK_TITLES[RiskKey.LiquidityBootstrappingPool],
    path: `/risks#${RiskKey.LiquidityBootstrappingPool}`,
    condition: pool => isV3LBP(pool),
  },

  // Network risks
  {
    key: RiskKey.Arbitrum,
    title: RISK_TITLES[RiskKey.Arbitrum],
    path: `/risks#${RiskKey.Arbitrum}`,
    condition: pool => pool.chain === GqlChain.Arbitrum,
  },
  {
    key: RiskKey.Optimism,
    title: RISK_TITLES[RiskKey.Optimism],
    path: `/risks#${RiskKey.Optimism}`,
    condition: pool => pool.chain === GqlChain.Optimism,
  },
  {
    key: RiskKey.Polygon,
    title: RISK_TITLES[RiskKey.Polygon],
    path: `/risks#${RiskKey.Polygon}`,
    condition: pool => pool.chain === GqlChain.Polygon,
  },
  {
    key: RiskKey.Zkevm,
    title: RISK_TITLES[RiskKey.Zkevm],
    path: `/risks#${RiskKey.Zkevm}`,
    condition: pool => pool.chain === GqlChain.Zkevm,
  },
  {
    key: RiskKey.Gnosis,
    title: RISK_TITLES[RiskKey.Gnosis],
    path: `/risks#${RiskKey.Gnosis}`,
    condition: pool => pool.chain === GqlChain.Gnosis,
  },
  {
    key: RiskKey.Base,
    title: RISK_TITLES[RiskKey.Base],
    path: `/risks#${RiskKey.Base}`,
    condition: pool => pool.chain === GqlChain.Base,
  },
  {
    key: RiskKey.Avalanche,
    title: RISK_TITLES[RiskKey.Avalanche],
    path: `/risks#${RiskKey.Avalanche}`,
    condition: pool => pool.chain === GqlChain.Avalanche,
  },
  {
    key: RiskKey.HyperEVM,
    title: RISK_TITLES[RiskKey.HyperEVM],
    path: `/risks#${RiskKey.HyperEVM}`,
    condition: pool => pool.chain === GqlChain.Hyperevm,
  },

  // Hook risks
  {
    key: RiskKey.Hook,
    title: RISK_TITLES[RiskKey.Hook],
    path: `/risks#${RiskKey.Hook}`,
    condition: pool => hasHooks(pool),
  },
  {
    key: RiskKey.StableSurgeHook,
    title: RISK_TITLES[RiskKey.StableSurgeHook],
    path: `/risks#${RiskKey.StableSurgeHook}`,
    condition: pool => hasHookType(pool, GqlHookType.StableSurge),
  },
  {
    key: RiskKey.MEVCaptureHook,
    title: RISK_TITLES[RiskKey.MEVCaptureHook],
    path: `/risks#${RiskKey.MEVCaptureHook}`,
    condition: pool => hasHookType(pool, GqlHookType.MevTax),
  },

  // Feature risks
  {
    key: RiskKey.NestedPool,
    title: RISK_TITLES[RiskKey.NestedPool],
    path: `/risks#${RiskKey.NestedPool}`,
    condition: pool => hasNestedPools(pool),
  },
  {
    key: RiskKey.Mutable,
    title: RISK_TITLES[RiskKey.Mutable],
    path: `/risks#${RiskKey.Mutable}`,
    condition: pool => isMutable(pool),
  },
]

export function getPoolRisks(pool: GqlPoolElement): Risk[] {
  const applicableRisks = RISK_CONDITIONS.filter(risk => risk.condition(pool))

  // Always add general risk
  const generalRisk: Risk = {
    title: RISK_TITLES[RiskKey.General],
    path: `/risks#${RiskKey.General}`,
  }

  return [
    generalRisk,
    ...applicableRisks.map(risk => ({
      title: risk.title,
      path: risk.path,
    })),
  ]
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
