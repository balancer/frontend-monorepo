/** Runtime constants for GraphQL enum-like union types.
 *  Codegen 6 emits these as `type` unions only (no runtime object),
 *  so we mirror each literal set as a const object for runtime use. */

import type {
  GqlChain,
  GqlHookType,
  GqlPoolAprItemType,
  GqlPoolEventType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlPoolSnapshotDataRange,
  GqlPoolStakingGaugeStatus,
  GqlPoolStakingType,
  GqlPoolType,
  GqlSorSwapType,
} from './generated/graphql.ts'

export const GqlChainValues = {
  Arbitrum: 'ARBITRUM',
  Avalanche: 'AVALANCHE',
  Base: 'BASE',
  Fantom: 'FANTOM',
  Fraxtal: 'FRAXTAL',
  Gnosis: 'GNOSIS',
  Hyperevm: 'HYPEREVM',
  Mainnet: 'MAINNET',
  Mode: 'MODE',
  Monad: 'MONAD',
  Optimism: 'OPTIMISM',
  Plasma: 'PLASMA',
  Polygon: 'POLYGON',
  Sepolia: 'SEPOLIA',
  Sonic: 'SONIC',
  Xlayer: 'XLAYER',
  Zkevm: 'ZKEVM',
} as const satisfies Record<string, GqlChain>

export const GqlHookTypeValues = {
  Akron: 'AKRON',
  DirectionalFee: 'DIRECTIONAL_FEE',
  ExitFee: 'EXIT_FEE',
  FeeTaking: 'FEE_TAKING',
  FixedLbp: 'FIXED_LBP',
  Lbp: 'LBP',
  Lottery: 'LOTTERY',
  MevTax: 'MEV_TAX',
  NftLiquidityPosition: 'NFTLIQUIDITY_POSITION',
  Reclamm: 'RECLAMM',
  StableSurge: 'STABLE_SURGE',
  Unknown: 'UNKNOWN',
  VeBalDiscount: 'VEBAL_DISCOUNT',
} as const satisfies Record<string, GqlHookType>

export const GqlPoolAprItemTypeValues = {
  Aura: 'AURA',
  DynamicSwapFee24h: 'DYNAMIC_SWAP_FEE_24H',
  Fuul: 'FUUL',
  IbYield: 'IB_YIELD',
  Locking: 'LOCKING',
  MaBeetsEmissions: 'MABEETS_EMISSIONS',
  Merkl: 'MERKL',
  Nested: 'NESTED',
  QuantAmmUplift: 'QUANT_AMM_UPLIFT',
  Staking: 'STAKING',
  StakingBoost: 'STAKING_BOOST',
  Surplus: 'SURPLUS',
  Surplus7d: 'SURPLUS_7D',
  Surplus24h: 'SURPLUS_24H',
  Surplus30d: 'SURPLUS_30D',
  SwapFee: 'SWAP_FEE',
  SwapFee7d: 'SWAP_FEE_7D',
  SwapFee24h: 'SWAP_FEE_24H',
  SwapFee30d: 'SWAP_FEE_30D',
  VeBalEmissions: 'VEBAL_EMISSIONS',
  Voting: 'VOTING',
} as const satisfies Record<string, GqlPoolAprItemType>

export const GqlPoolEventTypeValues = {
  Add: 'ADD',
  Remove: 'REMOVE',
  Swap: 'SWAP',
} as const satisfies Record<string, GqlPoolEventType>

export const GqlPoolOrderByValues = {
  Apr: 'apr',
  Fees24h: 'fees24h',
  TotalLiquidity: 'totalLiquidity',
  TotalShares: 'totalShares',
  UserBalanceUsd: 'userbalanceUsd',
  Volume24h: 'volume24h',
} as const satisfies Record<string, GqlPoolOrderBy>

export const GqlPoolOrderDirectionValues = {
  Asc: 'asc',
  Desc: 'desc',
} as const satisfies Record<string, GqlPoolOrderDirection>

export const GqlPoolSnapshotDataRangeValues = {
  AllTime: 'ALL_TIME',
  NinetyDays: 'NINETY_DAYS',
  OneHundredEightyDays: 'ONE_HUNDRED_EIGHTY_DAYS',
  OneYear: 'ONE_YEAR',
  ThirtyDays: 'THIRTY_DAYS',
} as const satisfies Record<string, GqlPoolSnapshotDataRange>

export const GqlPoolStakingGaugeStatusValues = {
  Active: 'ACTIVE',
  Killed: 'KILLED',
  Preferred: 'PREFERRED',
} as const satisfies Record<string, GqlPoolStakingGaugeStatus>

export const GqlPoolStakingTypeValues = {
  Aura: 'AURA',
  FreshBeets: 'FRESH_BEETS',
  Gauge: 'GAUGE',
  MasterChef: 'MASTER_CHEF',
  Reliquary: 'RELIQUARY',
  VeBal: 'VEBAL',
} as const satisfies Record<string, GqlPoolStakingType>

export const GqlPoolTypeValues = {
  ComposableStable: 'COMPOSABLE_STABLE',
  CowAmm: 'COW_AMM',
  Element: 'ELEMENT',
  FixedLbp: 'FIXED_LBP',
  Fx: 'FX',
  Gyro: 'GYRO',
  Gyro3: 'GYRO3',
  GyroE: 'GYROE',
  Investment: 'INVESTMENT',
  LiquidityBootstrapping: 'LIQUIDITY_BOOTSTRAPPING',
  MetaStable: 'META_STABLE',
  PhantomStable: 'PHANTOM_STABLE',
  QuantAmmWeighted: 'QUANT_AMM_WEIGHTED',
  Reclamm: 'RECLAMM',
  Stable: 'STABLE',
  Unknown: 'UNKNOWN',
  Weighted: 'WEIGHTED',
} as const satisfies Record<string, GqlPoolType>

export const GqlSorSwapTypeValues = {
  ExactIn: 'EXACT_IN',
  ExactOut: 'EXACT_OUT',
} as const satisfies Record<string, GqlSorSwapType>
