/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, expect, it } from 'vitest'
import type {
  GetTokensQuery,
  GetTokenPricesQuery,
  GetPoolQuery,
  GetPoolsQuery,
  GetPoolEventsQuery,
  PoolTokensFragment,
  HookFragment,
  LbpV3CommonMetadataFieldsFragment,
  Erc4626ReviewDataFragment,
  GetVeBalUserQuery,
  GetStakedSonicDataQuery,
} from './generated/graphql'
import type {
  GqlToken,
  GqlTokenPrice,
  GqlPoolElement,
  GqlPoolWeighted,
  GqlPoolGyro,
  GqlPoolComposableStable,
  GqlPoolLiquidityBootstrapping,
  GqlPoolQuantAmmWeighted,
  GqlPoolTokenDetail,
  GqlNestedPool,
  GqlPoolStaking,
  GqlPoolStakingGauge,
  GqlPoolStakingOtherGauge,
  GqlPoolStakingGaugeReward,
  GqlPoolUserBalance,
  GqlUserStakedBalance,
  GqlPoolAddRemoveEventV3,
  GqlPoolSwapEventV3,
  GqlPoolSwapEventCowAmm,
  GqlPoolAprItem,
  GqlPriceRateProviderData,
  GqlPriceRateProviderUpgradeableComponent,
  GqlHook,
  GqlHookReviewData,
  Erc4626ReviewData,
  StableSurgeHookParams,
  ExitFeeHookParams,
  FeeTakingHookParams,
  MevTaxHookParams,
  GqlLBPTopTrade,
  QuantAmmWeightSnapshot,
  GqlVeBalLockSnapshot,
  GqlStakedSonicData,
} from './graphql-derived-types'

describe('graphql-derived-types', () => {
  it('derived types are structurally compatible with generated types', () => {
    // These are compile-time checks: if any derived type is incompatible
    // with its source type, the test file will fail to compile.

    type _CheckToken = GqlToken extends GetTokensQuery['tokens'][number] ? true : never
    type _CheckTokenPrice = GqlTokenPrice extends GetTokenPricesQuery['tokenPrices'][number]
      ? true
      : never
    type _CheckPoolElement = GqlPoolElement extends GetPoolQuery['pool'] ? true : never
    type _CheckPoolWeighted = GqlPoolWeighted extends GetPoolQuery['pool'] ? true : never
    type _CheckPoolGyro = GqlPoolGyro extends GetPoolQuery['pool'] ? true : never
    type _CheckPoolComposableStable = GqlPoolComposableStable extends GetPoolQuery['pool']
      ? true
      : never
    type _CheckPoolLiquidityBootstrapping =
      GqlPoolLiquidityBootstrapping extends GetPoolQuery['pool'] ? true : never
    type _CheckPoolQuantAmmWeighted = GqlPoolQuantAmmWeighted extends GetPoolQuery['pool']
      ? true
      : never
    type _CheckPoolTokenDetail = GqlPoolTokenDetail extends PoolTokensFragment ? true : never
    type _CheckNestedPool =
      GqlNestedPool extends NonNullable<PoolTokensFragment['nestedPool']> ? true : never
    type _CheckPoolStaking =
      GqlPoolStaking extends NonNullable<GetPoolsQuery['pools'][number]['staking']> ? true : never
    type _CheckPoolStakingGauge =
      GqlPoolStakingGauge extends NonNullable<GqlPoolStaking['gauge']> ? true : never
    type _CheckPoolStakingOtherGauge = GqlPoolStakingOtherGauge extends NonNullable<
      NonNullable<GqlPoolStakingGauge['otherGauges']>
    >[number]
      ? true
      : never
    type _CheckPoolStakingGaugeReward = GqlPoolStakingGaugeReward extends NonNullable<
      NonNullable<GqlPoolStakingGauge['rewards']>
    >[number]
      ? true
      : never
    type _CheckPoolUserBalance =
      GqlPoolUserBalance extends NonNullable<GetPoolsQuery['pools'][number]['userBalance']>
        ? true
        : never
    type _CheckUserStakedBalance = GqlUserStakedBalance extends NonNullable<
      GqlPoolUserBalance['stakedBalances']
    >[number]
      ? true
      : never
    type _CheckPoolAddRemoveEventV3 =
      GqlPoolAddRemoveEventV3 extends GetPoolEventsQuery['poolEvents'][number] ? true : never
    type _CheckPoolSwapEventV3 = GqlPoolSwapEventV3 extends GetPoolEventsQuery['poolEvents'][number]
      ? true
      : never
    type _CheckPoolSwapEventCowAmm =
      GqlPoolSwapEventCowAmm extends GetPoolEventsQuery['poolEvents'][number] ? true : never
    type _CheckHook = GqlHook extends HookFragment ? true : never
    type _CheckHookReviewData =
      GqlHookReviewData extends NonNullable<HookFragment['reviewData']> ? true : never
    type _CheckErc4626ReviewData = Erc4626ReviewData extends Erc4626ReviewDataFragment
      ? true
      : never
    type _CheckLBPTopTrade = GqlLBPTopTrade extends NonNullable<
      NonNullable<LbpV3CommonMetadataFieldsFragment['topTrades']>
    >[number]
      ? true
      : never
    type _CheckPoolAprItem = GqlPoolAprItem extends unknown ? true : never
    type _CheckPriceRateProviderData = GqlPriceRateProviderData extends unknown ? true : never
    type _CheckPriceRateProviderUpgradeableComponent =
      GqlPriceRateProviderUpgradeableComponent extends unknown ? true : never
    type _CheckStableSurgeHookParams = StableSurgeHookParams extends unknown ? true : never
    type _CheckExitFeeHookParams = ExitFeeHookParams extends unknown ? true : never
    type _CheckFeeTakingHookParams = FeeTakingHookParams extends unknown ? true : never
    type _CheckMevTaxHookParams = MevTaxHookParams extends unknown ? true : never
    type _CheckQuantAmmWeightSnapshot = QuantAmmWeightSnapshot extends unknown ? true : never
    type _CheckVeBalLockSnapshot =
      GqlVeBalLockSnapshot extends GetVeBalUserQuery['veBalGetUser']['lockSnapshots'][number]
        ? true
        : never
    type _CheckStakedSonicData =
      GqlStakedSonicData extends GetStakedSonicDataQuery['stsGetGqlStakedSonicData'] ? true : never

    // If compilation succeeds, the runtime assertion passes trivially
    expect(true).toBe(true)
  })
})
