import {
  GetPoolQuery,
  GqlChain,
  GqlPoolComposableStableNested,
  GqlPoolTokenDetail,
  GqlPoolType,
  GqlPoolAprItem,
  GqlPoolTokenDisplay,
  GqlPoolAprItemType,
} from '@/lib/shared/services/api/generated/graphql'
import { invert } from 'lodash'
import {
  BaseVariant,
  FetchPoolProps,
  PartnerVariant,
  PoolAction,
  PoolListItem,
  PoolVariant,
} from './pool.types'
import { Numberish, bn, fNum } from '@/lib/shared/utils/numbers'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { TokenAmountHumanReadable } from '../tokens/token.types'
import { formatUnits, parseUnits } from 'viem'
import { ClaimablePool } from './actions/claim/ClaimProvider'
import { Pool } from './PoolProvider'
import BigNumber from 'bignumber.js'
import { TOTAL_APR_TYPES } from '@/lib/shared/hooks/useAprTooltip'

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
}

// Maps GraphQL chain enum to URL slug
export const chainToSlugMap: Record<GqlChain, ChainSlug> = {
  [GqlChain.Mainnet]: ChainSlug.Ethereum,
  [GqlChain.Arbitrum]: ChainSlug.Arbitrum,
  [GqlChain.Polygon]: ChainSlug.Polygon,
  [GqlChain.Avalanche]: ChainSlug.Avalanche,
  [GqlChain.Fantom]: ChainSlug.Fantom,
  [GqlChain.Base]: ChainSlug.Base,
  [GqlChain.Optimism]: ChainSlug.Optimisim,
  [GqlChain.Zkevm]: ChainSlug.Zkevm,
  [GqlChain.Gnosis]: ChainSlug.Gnosis,
  [GqlChain.Sepolia]: ChainSlug.Sepolia,
  [GqlChain.Mode]: ChainSlug.Mode,
  [GqlChain.Fraxtal]: ChainSlug.Fraxtal,
}
export const slugToChainMap = invert(chainToSlugMap) as Record<ChainSlug, GqlChain>

function getVariant(pool: Pool | PoolListItem): PoolVariant {
  // if a pool has certain properties return a custom variant
  if (pool.type === GqlPoolType.CowAmm) return PartnerVariant.cow
  if (pool.protocolVersion === 3) return BaseVariant.v3

  // default variant
  return BaseVariant.v2
}

/**
 * Constructs path to pool detail page.
 * @param {String} id Pool ID could be ID or address depending on variant.
 * @param {GqlChain} chain Chain enum.
 * @param {String} variant Pool variant, defaults to v2.
 * @returns {String} Path to pool detail page.
 */
export function getPoolPath(pool: Pool | PoolListItem) {
  const variant = getVariant(pool)
  return `/pools/${chainToSlugMap[pool.chain]}/${variant}/${pool.id}`
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
 * @param {string} [vebalBoost] - An optional boost value for calculation.
 * @returns {[BigNumber, BigNumber]} The total APR range.
 */
export function getTotalApr(
  aprItems: GqlPoolAprItem[],
  vebalBoost?: string
): [BigNumber, BigNumber] {
  let minTotal = bn(0)
  let maxTotal = bn(0)
  const boost = vebalBoost || 1

  aprItems
    // Filter known APR types to avoid including new unknown API types that are not yet displayed in the APR tooltip
    .filter(item => TOTAL_APR_TYPES.includes(item.type))
    .forEach(item => {
      if (item.type === GqlPoolAprItemType.StakingBoost) {
        maxTotal = bn(item.apr).times(boost).plus(maxTotal)
        return
      }

      if (item.type === GqlPoolAprItemType.VebalEmissions) {
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
 * @param {string} [vebalBoost] - An optional boost value for calculation.
 * @returns {string} The formatted total APR label.
 */
export function getTotalAprLabel(aprItems: GqlPoolAprItem[], vebalBoost?: string): string {
  const [minTotal, maxTotal] = getTotalApr(aprItems, vebalBoost)

  if (minTotal.eq(maxTotal) || vebalBoost) {
    return fNum('apr', minTotal.toString())
  } else {
    return `${fNum('apr', minTotal.toString())} - ${fNum('apr', maxTotal.toString())}`
  }
}

export function getTotalAprRaw(aprItems: GqlPoolAprItem[], vebalBoost?: string): string {
  const apr = getTotalAprLabel(aprItems, vebalBoost)
  return apr.substring(0, apr.length - 1)
}

// Maps GraphQL pool type enum to human readable label for UI.
const poolTypeLabelMap: { [key in GqlPoolType]: string } = {
  [GqlPoolType.Weighted]: 'Weighted',
  [GqlPoolType.Element]: 'Element',
  [GqlPoolType.Gyro]: 'Gyro 2-CLP',
  [GqlPoolType.Gyro3]: 'Gyro 3-CLP',
  [GqlPoolType.Gyroe]: 'Gyro E-CLP',
  [GqlPoolType.Investment]: 'Managed',
  [GqlPoolType.LiquidityBootstrapping]: 'LBP',
  [GqlPoolType.MetaStable]: 'Stable',
  [GqlPoolType.PhantomStable]: 'Stable',
  [GqlPoolType.Stable]: 'Stable',
  [GqlPoolType.Unknown]: 'Unknown',
  [GqlPoolType.Fx]: 'FX',
  [GqlPoolType.ComposableStable]: 'Stable',
  [GqlPoolType.CowAmm]: 'CoW AMM',
}

export function getPoolTypeLabel(type: GqlPoolType): string {
  return poolTypeLabelMap[type] ?? type.replace(/_/g, ' ').toLowerCase()
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

export function isComposableStablePool(pool: GetPoolQuery['pool'] | GqlPoolComposableStableNested) {
  return (
    pool.__typename === 'GqlPoolComposableStable' ||
    pool.__typename == 'GqlPoolComposableStableNested'
  )
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

export function getAuraPoolLink(chainId: number, pid: string) {
  return `https://app.aura.finance/#/${chainId}/pool/${pid}`
}

export function shouldHideSwapFee(poolType: GqlPoolType) {
  return poolType === GqlPoolType.CowAmm
}

export function getPoolDisplayTokens(pool: Pool) {
  return pool.poolTokens.filter(token =>
    pool.displayTokens.find(
      (displayToken: GqlPoolTokenDisplay) => token.address === displayToken.address
    )
  ) as GqlPoolTokenDetail[]
}
