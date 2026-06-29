import { TOTAL_APR_TYPES } from '@repo/lib/shared/hooks/useAprTooltip'
import type {
  GqlPoolAprItem,
  GqlPoolTokenDetail,
} from '@repo/lib/shared/services/api/graphql-derived-types'
import { GetPoolQuery } from '@repo/lib/shared/services/api/generated/graphql'
import type { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import {
  GqlPoolAprItemTypeValues,
  GqlPoolTypeValues,
} from '@repo/lib/shared/services/api/graphql-enums'
import { Numberish, bn, fNum, isValidNumber } from '@repo/lib/shared/utils/numbers'
import type BigNumber from 'bignumber.js'
import { cloneDeep, invert } from 'lodash'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { Address, formatUnits, parseUnits } from 'viem'
import { TokenAmountHumanReadable } from '../tokens/token.types'
import { ClaimablePool } from './actions/claim/ClaimProvider'
import {
  BaseVariant,
  FetchPoolProps,
  PartnerVariant,
  PoolAction,
  PoolListItem,
  PoolVariant,
  PoolCore,
} from './pool.types'
import { Pool } from './pool.types'
import { isSameAddress } from '@balancer/sdk'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'

// URL slug for each chain
export enum ChainSlug {
  Ethereum = 'ethereum',
  Arbitrum = 'arbitrum',
  Polygon = 'polygon',
  Avalanche = 'avalanche',
  Fantom = 'fantom',
  Base = 'base',
  Optimisim = 'optimism',
  Zkevm = 'zkevm',
  Gnosis = 'gnosis',
  Sepolia = 'sepolia',
  Mode = 'mode',
  Fraxtal = 'fraxtal',
  Sonic = 'sonic',
  HyperEVM = 'hyperevm',
  Plasma = 'plasma',
  Monad = 'monad',
  Xlayer = 'xlayer',
}

// Maps GraphQL chain enum to URL slug
export const chainToSlugMap: Partial<Record<GqlChain, ChainSlug>> = {
  [GqlChainValues.Mainnet]: ChainSlug.Ethereum,
  [GqlChainValues.Arbitrum]: ChainSlug.Arbitrum,
  [GqlChainValues.Polygon]: ChainSlug.Polygon,
  [GqlChainValues.Avalanche]: ChainSlug.Avalanche,
  [GqlChainValues.Fantom]: ChainSlug.Fantom,
  [GqlChainValues.Base]: ChainSlug.Base,
  [GqlChainValues.Optimism]: ChainSlug.Optimisim,
  [GqlChainValues.Zkevm]: ChainSlug.Zkevm,
  [GqlChainValues.Gnosis]: ChainSlug.Gnosis,
  [GqlChainValues.Sepolia]: ChainSlug.Sepolia,
  [GqlChainValues.Mode]: ChainSlug.Mode,
  [GqlChainValues.Fraxtal]: ChainSlug.Fraxtal,
  [GqlChainValues.Sonic]: ChainSlug.Sonic,
  [GqlChainValues.Hyperevm]: ChainSlug.HyperEVM,
  [GqlChainValues.Plasma]: ChainSlug.Plasma,
  [GqlChainValues.Monad]: ChainSlug.Monad,
  [GqlChainValues.Xlayer]: ChainSlug.Xlayer,
}

export function getChainSlug(chainSlug: ChainSlug): GqlChain {
  const slugToChainMap = invert(chainToSlugMap) as Record<ChainSlug, GqlChain>
  const chain = slugToChainMap[chainSlug]
  if (!chain) throw new Error(`Chain ${chainSlug} is not a valid chainName`)
  return chain
}

function getVariant(type: GqlPoolType, protocolVersion: number | undefined): PoolVariant {
  // if a pool has certain properties return a custom variant
  if (type === GqlPoolTypeValues.CowAmm) return PartnerVariant.cow
  if (protocolVersion === 3) return BaseVariant.v3

  // default variant
  return BaseVariant.v2
}

/**
 * Constructs path to pool detail page.
 * @returns {String} Path to pool detail page.
 */

export function getPoolPath(params: Pick<PoolCore, 'id' | 'chain' | 'type' | 'protocolVersion'>) {
  const variant = getVariant(params.type, params.protocolVersion)
  return `/pools/${chainToSlugMap[params.chain]}/${variant}/${params.id}`
}

export function getNestedPoolPath({
  pool,
  nestedPoolAddress,
}: {
  pool: PoolCore
  nestedPoolAddress: Address
}) {
  const variant = getVariant(pool.type, pool.protocolVersion)
  return `/pools/${chainToSlugMap[pool.chain]}/${variant}/${nestedPoolAddress}`
}

// TODO: the following 2 functions (getAprLabel & getTotalAprLabel) most likely need revisiting somewhere in the near future and refactored to just one
/**
 * Constructs path to pool action page.
 * @param {String} id Pool ID could be ID or address depending on variant.
 * @param {GqlChain} chain Chain enum.
 * @param {String} variant Pool variant, defaults to v2.
 * @param {PoolAction} action Pool action.
 * @returns {String} Path to pool detail page.
 */
export function getPoolActionPath({
  id,
  chain,
  variant = BaseVariant.v2,
  action,
}: FetchPoolProps & { action: PoolAction }) {
  return `/pools/${chainToSlugMap[chain]}/${variant}/${id}/${action}`
}

/**
 * Calculates the total APR based on the array of APR items and an optional boost value.
 *
 * @param {GqlPoolAprItem[]} aprItems - The array of APR items to calculate the total APR from.
 * @returns {[BigNumber, BigNumber]} The total APR range.
 */
export function getTotalApr(aprItems: GqlPoolAprItem[]): [BigNumber, BigNumber] {
  let minTotal = bn(0)
  let maxTotal = bn(0)

  aprItems
    // Filter known APR types to avoid including new unknown API types that are not yet displayed in the APR tooltip
    .filter(item => TOTAL_APR_TYPES.includes(item.type))
    .forEach(item => {
      if (!isValidNumber(item.apr)) return

      if (item.type === GqlPoolAprItemTypeValues.StakingBoost) {
        maxTotal = bn(item.apr).plus(maxTotal)
        return
      }

      if (item.type === GqlPoolAprItemTypeValues.VeBalEmissions) {
        // We don't add this to maxTotal as is already included on the staking boost
        minTotal = bn(item.apr).plus(minTotal)
        return // Deprecated, should be 0 once emissions stop
      }

      if (item.type === GqlPoolAprItemTypeValues.MaBeetsEmissions) {
        minTotal = bn(item.apr).plus(minTotal)
        maxTotal = bn(item.apr).plus(maxTotal)
        return
      }

      minTotal = bn(item.apr).plus(minTotal)
      maxTotal = bn(item.apr).plus(maxTotal)
    })

  return [minTotal, maxTotal]
}

/**
 * Calculates the total APR label based on the array of APR items and an optional boost value.
 *
 * @param {GqlPoolAprItem[]} aprItems - The array of APR items to calculate the total APR label from.
 * @returns {string} The formatted total APR label.
 */
export function getTotalAprLabel(aprItems: GqlPoolAprItem[], canBeNegative = false): string {
  const [minTotal, maxTotal] = getTotalApr(aprItems)

  if (minTotal.eq(maxTotal)) {
    return fNum('apr', minTotal.toString(), { canBeNegative }) // only a single apr could be negative?
  } else {
    return `${fNum('apr', minTotal.toString())} - ${fNum('apr', maxTotal.toString())}`
  }
}

export function getTotalAprRaw(aprItems: GqlPoolAprItem[]): string {
  const [minTotal] = getTotalApr(aprItems)
  return minTotal.toString()
}

// Maps GraphQL pool type enum to human readable label for UI.
const poolTypeLabelMap: Partial<Record<GqlPoolType, string>> = {
  [GqlPoolTypeValues.Weighted]: 'Weighted',
  [GqlPoolTypeValues.Element]: 'Element',
  [GqlPoolTypeValues.Gyro]: '2-CLP',
  [GqlPoolTypeValues.Gyro3]: '3-CLP',
  [GqlPoolTypeValues.GyroE]: 'E-CLP',
  [GqlPoolTypeValues.Investment]: 'Managed',
  [GqlPoolTypeValues.LiquidityBootstrapping]: 'Dynamic LBP',
  [GqlPoolTypeValues.MetaStable]: 'Stable',
  [GqlPoolTypeValues.PhantomStable]: 'Stable',
  [GqlPoolTypeValues.Stable]: 'Stable',
  [GqlPoolTypeValues.Unknown]: 'Unknown',
  [GqlPoolTypeValues.Fx]: 'FX',
  [GqlPoolTypeValues.ComposableStable]: 'Stable',
  [GqlPoolTypeValues.CowAmm]: 'CoW AMM',
  [GqlPoolTypeValues.QuantAmmWeighted]: 'BTF',
  [GqlPoolTypeValues.Reclamm]: 'AutoRange',
  [GqlPoolTypeValues.FixedLbp]: 'Fixed LBP',
}

export function getPoolTypeLabel(type: GqlPoolType): string {
  const label = type.replace(/_/g, ' ').toLowerCase()
  return poolTypeLabelMap[type] ?? label.charAt(0).toUpperCase() + label.slice(1)
}

export const poolClickHandler = (
  event: React.MouseEvent<HTMLElement>,
  pool: Pool | PoolListItem,
  router: AppRouterInstance
) => {
  const poolPath = getPoolPath(pool)

  if (event.ctrlKey || event.metaKey) {
    window.open(poolPath, '_blank')
  } else {
    router.push(poolPath)
  }
}

// Prefetch pool page on hover, otherwise there is a significant delay
// between clicking the pool and the pool page loading.
export const poolMouseEnterHandler = (
  event: React.MouseEvent<HTMLElement>,
  pool: Pool | PoolListItem,
  router: AppRouterInstance
) => {
  const poolPath = getPoolPath(pool)
  router.prefetch(poolPath)
}

export function isComposableStablePool(pool: GetPoolQuery['pool']) {
  return pool.__typename === 'GqlPoolComposableStable'
}

export function getProportionalExitAmountsForBptIn(
  bptInHumanReadable: string,
  poolTokens: GqlPoolTokenDetail[],
  poolTotalShares: string
): TokenAmountHumanReadable[] {
  const bptInAmountScaled = parseUnits(bptInHumanReadable, 18)
  return getProportionalExitAmountsFromScaledBptIn(bptInAmountScaled, poolTokens, poolTotalShares)
}

export function getProportionalExitAmountsFromScaledBptIn(
  bptIn: bigint,
  poolTokens: { balance: string; decimals: number; address: string }[],
  poolTotalShares: string
): TokenAmountHumanReadable[] {
  const bptTotalSupply = parseUnits(poolTotalShares, 18)

  return poolTokens.map(token => {
    const tokenBalance = parseUnits(token.balance, token.decimals)
    const tokenProportionalAmount = bptTotalSupply ? (bptIn * tokenBalance) / bptTotalSupply : 0n

    return {
      address: token.address,
      amount: formatUnits(tokenProportionalAmount, token.decimals),
    }
  })
}

/**
 *
 * @description Returns a map of pool by gauge id
 * @example getPoolsByGaugesMap(pools) => { '0x123': pool1, '0x456': pool2 }
 */
export function getPoolsByGaugesMap(pools: ClaimablePool[]) {
  return pools.reduce((acc: Record<string, ClaimablePool>, pool) => {
    const gaugeId = pool.staking?.gauge?.id || ''
    if (gaugeId) {
      acc[gaugeId] = pool
    }
    pool.staking?.gauge?.otherGauges?.forEach(otherGauge => {
      const otherGaugeId = otherGauge.id
      if (otherGaugeId) {
        acc[otherGaugeId] = pool
      }
    })

    return acc
  }, {})
}

export function calcPotentialYieldFor(pool: Pool, amountUsd: Numberish): string {
  const [, maxTotalApr] = getTotalApr(pool.dynamicData.aprItems)

  return bn(amountUsd).times(maxTotalApr).div(52).toString()
}

export function getXavePoolLink(chain: string, poolAddress: string) {
  return `https://app.xave.co/pool/${chain.toLowerCase()}/${poolAddress}`
}

export function shouldHideSwapFee(poolType: GqlPoolType) {
  return poolType === GqlPoolTypeValues.CowAmm
}

export function shouldCallComputeDynamicSwapFee(pool: Pool) {
  return pool.hook && pool.hook.config?.shouldCallComputeDynamicSwapFee
}

/**
 * Removes hook data from pool if the hook address is the same as the pool address.
 * This is necessary for pools that have a hook with the same address as the pool, these can be ignored in the ui but not in the api
 */
export function removeHookDataFromPoolIfNecessary(pool: Pool | PoolListItem) {
  const clone = cloneDeep(pool)

  if (clone.hook && isSameAddress(clone.hook.address as Address, clone.address as Address)) {
    ;(clone as Record<string, unknown>).hook = undefined
  }

  return clone
}

export function hasMultipleNetworks(supportedNetworks: GqlChain[]) {
  return supportedNetworks.length > 1
}
