import { TOTAL_APR_TYPES } from '@repo/lib/shared/hooks/useAprTooltip'
import {
  GetPoolQuery,
  GqlChain,
  GqlPoolAprItem,
  GqlPoolAprItemType,
  GqlPoolComposableStableNested,
  GqlPoolTokenDetail,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { Numberish, bn, fNum } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { invert } from 'lodash'
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
  [GqlChain.Sonic]: ChainSlug.Sonic,
}

export function getChainSlug(chainSlug: ChainSlug): GqlChain {
  const slugToChainMap = invert(chainToSlugMap) as Record<ChainSlug, GqlChain>
  const chain = slugToChainMap[chainSlug]
  if (!chain) throw new Error(`Chain ${chainSlug} is not a valid chainName`)
  return chain
}

function getVariant(type: GqlPoolType, protocolVersion: number | undefined): PoolVariant {
  // if a pool has certain properties return a custom variant
  if (type === GqlPoolType.CowAmm) return PartnerVariant.cow
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

      if (item.type === GqlPoolAprItemType.MabeetsEmissions) {
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
export function getTotalAprLabel(
  aprItems: GqlPoolAprItem[],
  vebalBoost?: string,
  canBeNegative = false
): string {
  const [minTotal, maxTotal] = getTotalApr(aprItems, vebalBoost)

  if (minTotal.eq(maxTotal) || vebalBoost) {
    return fNum('apr', minTotal.toString(), { canBeNegative }) // only a single apr could be negative?
  } else {
    return `${fNum('apr', minTotal.toString())} - ${fNum('apr', maxTotal.toString())}`
  }
}

export function getTotalAprRaw(aprItems: GqlPoolAprItem[], vebalBoost?: string): string {
  const [minTotal] = getTotalApr(aprItems, vebalBoost)
  return minTotal.toString()
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
  [GqlPoolType.CowAmm]: 'Weighted',
  [GqlPoolType.QuantAmmWeighted]: 'BTF',
  [GqlPoolType.Reclamm]: 'ReClamm',
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

export function getXavePoolLink(chain: string, poolAddress: string) {
  return `https://app.xave.co/pool/${chain.toLowerCase()}/${poolAddress}`
}

export function shouldHideSwapFee(poolType: GqlPoolType) {
  return poolType === GqlPoolType.CowAmm
}

export function shouldCallComputeDynamicSwapFee(pool: Pool) {
  return pool.hook && pool.hook.config?.shouldCallComputeDynamicSwapFee
}
