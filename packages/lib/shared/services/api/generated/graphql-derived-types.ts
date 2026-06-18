/** Derived type aliases for broad schema object types that Codegen 6 no longer emits.
 *  Codegen 5 generated standalone types like GqlToken, GqlPoolElement, etc.
 *  Codegen 6 only emits operation-specific result types and fragment types.
 *  These aliases restore the old names so consumers don't need refactoring. */

import type {
  GetTokensQuery,
  GetTokenPricesQuery,
  GetPoolQuery,
  GetPoolsQuery,
  GetPoolEventsQuery,
  PoolTokensFragment,
  HookFragment,
  LbpV3CommonMetadataFieldsFragment,
  FixedPriceLbpCommonMetadataFieldsFragment,
  GqlTokenDynamicDataFragment,
  Erc4626ReviewDataFragment,
  GetVeBalUserQuery,
  GetStakedSonicDataQuery,
} from './graphql.js'

// ── Token types ──

type _GqlTokenData = GetTokensQuery['tokens'][number]
// Note: coingeckoId and priceRateProviderData are made required here to match
// ApiToken = Omit<GetTokensQuery['tokens'][number], '__typename'> which has them as required.
// Test data that omits these fields uses `as GqlToken` assertions.
export type GqlToken = Omit<_GqlTokenData, 'coingeckoId' | 'priceRateProviderData'> & {
  coingeckoId: string | null
  priceRateProviderData: _GqlTokenData['priceRateProviderData']
}
// Alias for consumers using old PascalCase
export type GqlLbpTopTrade = GqlLBPTopTrade
export type GqlTokenPrice = GetTokenPricesQuery['tokenPrices'][number]

// ── Pool discriminated union members ──

export type GqlPoolElement = Extract<GetPoolQuery['pool'], { __typename: 'GqlPoolElement' }>
export type GqlPoolWeighted = Extract<GetPoolQuery['pool'], { __typename: 'GqlPoolWeighted' }>
export type GqlPoolGyro = Extract<GetPoolQuery['pool'], { __typename: 'GqlPoolGyro' }>
export type GqlPoolComposableStable = Extract<
  GetPoolQuery['pool'],
  { __typename: 'GqlPoolComposableStable' }
>
export type GqlPoolLiquidityBootstrapping = Extract<
  GetPoolQuery['pool'],
  { __typename: 'GqlPoolLiquidityBootstrapping' }
>
export type GqlPoolQuantAmmWeighted = Extract<
  GetPoolQuery['pool'],
  { __typename: 'GqlPoolQuantAmmWeighted' }
>

// ── LBP-specific pool types (use fragment exports directly when possible) ──

export type GqlPoolLiquidityBootstrappingV3 = Extract<
  GetPoolQuery['pool'],
  { __typename: 'GqlPoolLiquidityBootstrappingV3' }
>
export type GqlPoolFixedPriceLbp = Extract<
  GetPoolQuery['pool'],
  { __typename: 'GqlPoolFixedPriceLBP' }
>

// ── Common pool type: union of all pool __typename variants ──

export type GqlPoolBase = GetPoolQuery['pool']

// ── Pool list (minimal) types ──

export type GqlPoolMinimal = GetPoolsQuery['pools'][number]

// ── Token detail / nested pool types ──

export type GqlPoolTokenDetail = PoolTokensFragment
export type GqlNestedPool = NonNullable<PoolTokensFragment['nestedPool']>

// ── Staking types (extracted from GetPoolsQuery) ──

export type GqlPoolStaking = NonNullable<GetPoolsQuery['pools'][number]['staking']>
export type GqlPoolStakingGauge = NonNullable<GqlPoolStaking['gauge']>
export type GqlPoolStakingOtherGauge = NonNullable<
  NonNullable<GqlPoolStakingGauge['otherGauges']>
>[number]
export type GqlPoolStakingGaugeReward = NonNullable<
  NonNullable<GqlPoolStakingGauge['rewards']>
>[number]

// ── User balance types ──

export type GqlPoolUserBalance = NonNullable<GetPoolsQuery['pools'][number]['userBalance']>
export type GqlUserStakedBalance = NonNullable<
  NonNullable<GqlPoolUserBalance['stakedBalances']>
>[number]

// ── Pool event types ──

export type GqlPoolAddRemoveEventV3 = Extract<
  GetPoolEventsQuery['poolEvents'][number],
  { __typename: 'GqlPoolAddRemoveEventV3' }
>
export type GqlPoolSwapEventV3 = Extract<
  GetPoolEventsQuery['poolEvents'][number],
  { __typename: 'GqlPoolSwapEventV3' }
>
export type GqlPoolSwapEventCowAmm = Extract<
  GetPoolEventsQuery['poolEvents'][number],
  { __typename: 'GqlPoolSwapEventCowAmm' }
>

// ── APR item types ──

export type GqlPoolAprItem = NonNullable<
  NonNullable<GetPoolQuery['pool'] extends infer P
    ? P extends { dynamicData?: { aprItems?: Array<infer T> } }
      ? T
      : never
    : never>
>

// ── Price rate provider / review data types (inline objects) ──

export type GqlPriceRateProviderData = {
  __typename?: 'GqlPriceRateProviderData'
  address: string
  reviewed: boolean
  name: string | null
  warnings: Array<string> | null
  summary?: string | null
  reviewFile?: string | null
  factory?: string | null
  upgradeableComponents?: Array<{ __typename?: 'GqlPriceRateProviderUpgradeableComponent'; entryPoint: string; implementationReviewed: string } | null> | null
}
export type GqlPriceRateProviderUpgradeableComponent = NonNullable<
  NonNullable<GqlPriceRateProviderData['upgradeableComponents']>
>[number]

export type GqlHook = HookFragment
export type GqlHookReviewData = NonNullable<HookFragment['reviewData']>

export type Erc4626ReviewData = Erc4626ReviewDataFragment

// ── Hook param types ──

export type StableSurgeHookParams = { __typename: 'StableSurgeHookParams'; maxSurgeFeePercentage: string | null; surgeThresholdPercentage: string | null }
export type ExitFeeHookParams = { __typename: 'ExitFeeHookParams'; exitFeePercentage: string | null }
export type FeeTakingHookParams = { __typename: 'FeeTakingHookParams'; addLiquidityFeePercentage: string | null; removeLiquidityFeePercentage: string | null; swapFeePercentage: string | null }
export type MevTaxHookParams = { __typename: 'MevTaxHookParams'; mevTaxThreshold: string | null; mevTaxMultiplier: string | null; maxMevSwapFeePercentage: string | null }

// ── LBP-specific additional types ──

export type GqlLBPTopTrade = NonNullable<
  NonNullable<LbpV3CommonMetadataFieldsFragment['topTrades']>
>[number]

// ── Quant AMM types ──

export type QuantAmmWeightSnapshot = NonNullable<
  Extract<GetPoolQuery['pool'], { __typename: 'GqlPoolQuantAmmWeighted' }> extends {
    weightSnapshots?: Array<infer T> | null
  }
    ? T
    : never
>

// ── Misc types from other queries ──

export type GqlVeBalLockSnapshot = GetVeBalUserQuery['veBalGetUser']['lockSnapshots'][number]
export type GqlStakedSonicData = GetStakedSonicDataQuery['stsGetGqlStakedSonicData']
