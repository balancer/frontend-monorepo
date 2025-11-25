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

export enum RiskCategory {
  PoolSpecific = 'Pool specific risks',
  Token = 'Token risks',
  General = 'General risks',
}

export const RISK_TITLES: Partial<Record<RiskKey, string>> = {
  [RiskKey.General]: `${PROJECT_CONFIG.projectName} protocol`,
  [RiskKey.Weighted]: 'Weighted pool',
  [RiskKey.Stable]: 'Stable pool',
  [RiskKey.ComposableStable]: 'Composable stable pool',
  [RiskKey.MetaStable]: 'MetaStable pool',
  [RiskKey.Boosted]: 'Boosted tokens',
  [RiskKey.Clp]: 'Concentrated Liquidity pool',
  [RiskKey.Arbitrum]: 'L2 network: Arbitrum',
  [RiskKey.Polygon]: 'Sidechain network: Polygon',
  [RiskKey.Zkevm]: 'L2 network: Polygon zkEVM',
  [RiskKey.Optimism]: 'L2 network: Optimism',
  [RiskKey.Gnosis]: 'Sidechain network: Gnosis',
  [RiskKey.Base]: 'L2 network: Base',
  [RiskKey.Avalanche]: 'L1 network: Avalanche',
  [RiskKey.HyperEVM]: 'L1 network: HyperEVM',
  [RiskKey.Mutable]: 'Mutable attributes',
  [RiskKey.Composability]: 'Composability',
  [RiskKey.RateProvider]: 'Rate provider',
  [RiskKey.RateProviderBridge]: 'Rate provider cross-chain bridge: Layer Zero',
  [RiskKey.NestedPool]: 'Nested pool',
  [RiskKey.Hook]: 'Hooks',
  [RiskKey.StableSurgeHook]: 'StableSurge hook',
  [RiskKey.MEVCaptureHook]: 'MEV Capture hook',
  [RiskKey.QuantAmmWeighted]: 'BTF pool',
  [RiskKey.ReclAmm]: 'reCLAMM pool',
  [RiskKey.LiquidityBootstrappingPool]: 'Liquidity Bootstrapping pool',
}

export type Risk = {
  title: string | undefined
  path: string
}

export interface RiskDefinition {
  key: RiskKey
  title: string | undefined
  path: string
  category: RiskCategory
  condition: (pool: GqlPoolElement) => boolean
}

export interface RiskCategoryGroup {
  category: RiskCategory
  title: string
  risks: Risk[]
}

// Risk condition definitions
const RISK_CONDITIONS: RiskDefinition[] = [
  {
    key: RiskKey.Weighted,
    title: RISK_TITLES[RiskKey.Weighted],
    path: `/risks#${RiskKey.Weighted}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isWeighted(pool.type),
  },
  {
    key: RiskKey.Stable,
    title: RISK_TITLES[RiskKey.Stable],
    path: `/risks#${RiskKey.Stable}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isStable(pool.type),
  },
  {
    key: RiskKey.MetaStable,
    title: RISK_TITLES[RiskKey.MetaStable],
    path: `/risks#${RiskKey.MetaStable}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isMetaStable(pool.type),
  },
  {
    key: RiskKey.Clp,
    title: RISK_TITLES[RiskKey.Clp],
    path: `/risks#${RiskKey.Clp}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isGyro(pool.type),
  },
  {
    key: RiskKey.Boosted,
    title: RISK_TITLES[RiskKey.Boosted],
    path: `/risks#${RiskKey.Boosted}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => !!isBoosted(pool),
  },
  {
    key: RiskKey.QuantAmmWeighted,
    title: RISK_TITLES[RiskKey.QuantAmmWeighted],
    path: `/risks#${RiskKey.QuantAmmWeighted}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isQuantAmmPool(pool.type),
  },
  {
    key: RiskKey.ReclAmm,
    title: RISK_TITLES[RiskKey.ReclAmm],
    path: `/risks#${RiskKey.ReclAmm}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isReclAmm(pool.type),
  },
  {
    key: RiskKey.LiquidityBootstrappingPool,
    title: RISK_TITLES[RiskKey.LiquidityBootstrappingPool],
    path: `/risks#${RiskKey.LiquidityBootstrappingPool}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isV3LBP(pool),
  },

  // General Network risks
  {
    key: RiskKey.Arbitrum,
    title: RISK_TITLES[RiskKey.Arbitrum],
    path: `/risks#${RiskKey.Arbitrum}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Arbitrum,
  },
  {
    key: RiskKey.Optimism,
    title: RISK_TITLES[RiskKey.Optimism],
    path: `/risks#${RiskKey.Optimism}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Optimism,
  },
  {
    key: RiskKey.Polygon,
    title: RISK_TITLES[RiskKey.Polygon],
    path: `/risks#${RiskKey.Polygon}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Polygon,
  },
  {
    key: RiskKey.Zkevm,
    title: RISK_TITLES[RiskKey.Zkevm],
    path: `/risks#${RiskKey.Zkevm}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Zkevm,
  },
  {
    key: RiskKey.Gnosis,
    title: RISK_TITLES[RiskKey.Gnosis],
    path: `/risks#${RiskKey.Gnosis}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Gnosis,
  },
  {
    key: RiskKey.Base,
    title: RISK_TITLES[RiskKey.Base],
    path: `/risks#${RiskKey.Base}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Base,
  },
  {
    key: RiskKey.Avalanche,
    title: RISK_TITLES[RiskKey.Avalanche],
    path: `/risks#${RiskKey.Avalanche}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Avalanche,
  },
  {
    key: RiskKey.HyperEVM,
    title: RISK_TITLES[RiskKey.HyperEVM],
    path: `/risks#${RiskKey.HyperEVM}`,
    category: RiskCategory.General,
    condition: pool => pool.chain === GqlChain.Hyperevm,
  },

  // Hook risks
  {
    key: RiskKey.Hook,
    title: RISK_TITLES[RiskKey.Hook],
    path: `/risks#${RiskKey.Hook}`,
    category: RiskCategory.General,
    condition: pool => hasHooks(pool),
  },
  {
    key: RiskKey.StableSurgeHook,
    title: RISK_TITLES[RiskKey.StableSurgeHook],
    path: `/risks#${RiskKey.StableSurgeHook}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => hasHookType(pool, GqlHookType.StableSurge),
  },
  {
    key: RiskKey.MEVCaptureHook,
    title: RISK_TITLES[RiskKey.MEVCaptureHook],
    path: `/risks#${RiskKey.MEVCaptureHook}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => hasHookType(pool, GqlHookType.MevTax),
  },

  // Pool specific feature risks
  {
    key: RiskKey.NestedPool,
    title: RISK_TITLES[RiskKey.NestedPool],
    path: `/risks#${RiskKey.NestedPool}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => hasNestedPools(pool),
  },
  {
    key: RiskKey.Mutable,
    title: RISK_TITLES[RiskKey.Mutable],
    path: `/risks#${RiskKey.Mutable}`,
    category: RiskCategory.PoolSpecific,
    condition: pool => isMutable(pool),
  },
]

export function getPoolRisks(pool: GqlPoolElement): RiskCategoryGroup[] {
  const applicableRisks = RISK_CONDITIONS.filter(risk => risk.condition(pool))

  // Group risks by category
  const grouped: Record<RiskCategory, Risk[]> = {
    [RiskCategory.PoolSpecific]: [],
    [RiskCategory.Token]: [],
    [RiskCategory.General]: [],
  }

  // Add general risk
  const generalProtocolRisk: Risk = {
    title: RISK_TITLES[RiskKey.General] || 'General protocol risks',
    path: `/risks#${RiskKey.General}`,
  }
  grouped[RiskCategory.General].push(generalProtocolRisk)

  // Group applicable risks
  applicableRisks.forEach(risk => {
    const riskItem: Risk = {
      title: risk.title || 'Risk',
      path: risk.path,
    }
    grouped[risk.category].push(riskItem)
  })

  // Convert to hierarchical structure
  return Object.entries(grouped)
    .filter(([, risks]) => risks.length > 0)
    .map(([category, risks]) => ({
      category: category as RiskCategory,
      title: category as RiskCategory,
      risks,
    }))
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
