import { getChainId, getNetworkConfig } from '@/lib/config/app.config'
import { getBlockExplorerAddressUrl } from '@/lib/shared/hooks/useBlockExplorer'
import {
  GetPoolQuery,
  GqlChain,
  GqlPoolBase,
  GqlPoolNestingType,
  GqlPoolStakingGauge,
  GqlPoolStakingOtherGauge,
  GqlPoolTokenDetail,
  GqlPoolType,
} from '@/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { Numberish, bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { isEmpty, isNil } from 'lodash'
import { Address, getAddress, parseUnits, zeroAddress } from 'viem'
import { BPT_DECIMALS } from './pool.constants'
import { isNotMainnet } from '../chains/chain.utils'
import { ClaimablePool } from './actions/claim/ClaimProvider'
import { PoolIssue } from './alerts/pool-issues/PoolIssue.type'
import { getUserTotalBalanceInt } from './user-balance.helpers'
import { dateToUnixTimestamp } from '@/lib/shared/utils/time'
import { balancerV2VaultAbi } from '../web3/contracts/abi/generated'
import { balancerV3VaultAbi } from '../web3/contracts/abi/balancerV3Abi'

/**
 * METHODS
 */
export function addressFor(poolId: string): string {
  return getAddress(poolId.slice(0, 42))
}

export function isStable(poolType: GqlPoolType): boolean {
  return (
    poolType === GqlPoolType.Stable ||
    poolType === GqlPoolType.MetaStable ||
    poolType === GqlPoolType.ComposableStable
  )
}

export function isNonComposableStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.Stable || poolType === GqlPoolType.MetaStable
}

export function isMetaStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.MetaStable
}

export function isComposableStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.ComposableStable
}

export function isComposableStableV1(pool: Pool): boolean {
  return isComposableStable(pool.type) && pool.version === 1
}

export function isFx(poolType: GqlPoolType | string): boolean {
  return poolType === GqlPoolType.Fx
}

// TODO: verify how to determine boosted pool from api
export function isBoosted(poolType: GqlPoolType) {
  return poolType === GqlPoolType.PhantomStable
}

export function isGyro(poolType: GqlPoolType) {
  return [GqlPoolType.Gyro, GqlPoolType.Gyro3, GqlPoolType.Gyroe].includes(poolType)
}

export function isClp(poolType: GqlPoolType) {
  return isGyro(poolType)
}

export function isUnknownType(poolType: any): boolean {
  return !Object.values(GqlPoolType).includes(poolType)
}

export function isLiquidityBootstrapping(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.LiquidityBootstrapping
}

export function isLBP(poolType: GqlPoolType): boolean {
  return isLiquidityBootstrapping(poolType)
}

export function isWeighted(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.Weighted
}

export function isManaged(poolType: GqlPoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === GqlPoolType.Investment
}

export function isWeightedLike(poolType: GqlPoolType): boolean {
  return isWeighted(poolType) || isManaged(poolType) || isLiquidityBootstrapping(poolType)
}

export function isStableLike(poolType: GqlPoolType): boolean {
  return (
    isStable(poolType) ||
    isMetaStable(poolType) ||
    isComposableStable(poolType) ||
    isFx(poolType) ||
    isGyro(poolType)
  )
}

export function isSwappingHaltable(poolType: GqlPoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType)
}

export function isVebalPool(poolId: string): boolean {
  return (
    poolId.toLowerCase() === '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'
  )
}

export function isCowAmmPool(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.CowAmm
}

export function noInitLiquidity(pool: GqlPoolBase): boolean {
  // Uncomment to DEBUG
  // if (
  //   pool.id ===
  //   '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'
  // )
  //   return true;
  return new BigNumber(pool.dynamicData.totalShares || '0').eq(0)
}
export function preMintedBptIndex(pool: GqlPoolBase): number | void {
  return pool.allTokens.findIndex(token => isSameAddress(token.address, pool.address))
}

export function calcBptPrice(totalLiquidity: string, totalShares: string): string {
  return bn(totalLiquidity).div(totalShares).toString()
}

export function calcBptPriceFor(pool: GetPoolQuery['pool']): string {
  return calcBptPrice(pool.dynamicData.totalLiquidity, pool.dynamicData.totalShares)
}

export function bptUsdValue(pool: GetPoolQuery['pool'], bptAmount: Numberish): string {
  return bn(bptAmount).times(calcBptPriceFor(pool)).toString()
}

export function createdAfterTimestamp(pool: GqlPoolBase): boolean {
  // Pools should always have valid createTime so, for safety, we block the pool in case we don't get it
  // (createTime should probably not be treated as optional in the SDK types)
  if (!pool.createTime) return true

  const creationTimestampLimit = dateToUnixTimestamp('2023-03-29')

  // // Uncomment to debug
  // if (
  //   pool.id ===
  //   '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080'
  // )
  //   creationTimestampLimit = dateToUnixTimestamp('2021-08-13'); //DEBUG DATE

  // Epoch timestamp is bigger if the date is older
  return pool.createTime > creationTimestampLimit
}

export function calcUserShareOfPool(pool: Pool) {
  const userBalance = getUserTotalBalanceInt(pool)
  return calcShareOfPool(pool, userBalance)
}

export function calcShareOfPool(pool: Pool, rawBalance: bigint) {
  return bn(rawBalance).div(bn(parseUnits(pool.dynamicData.totalShares, BPT_DECIMALS)))
}

type Pool = GetPoolQuery['pool']
export function usePoolHelpers(pool: Pool, chain: GqlChain) {
  const gaugeExplorerLink = getBlockExplorerAddressUrl(
    pool?.staking?.gauge?.gaugeAddress as Address,
    chain
  )
  const poolExplorerLink = getBlockExplorerAddressUrl(pool.address as Address, chain)

  const hasGaugeAddress = !!pool?.staking?.gauge?.gaugeAddress

  const gaugeAddress = pool?.staking?.gauge?.gaugeAddress || ''

  const chainId = getChainId(pool.chain)

  return {
    poolExplorerLink,
    gaugeExplorerLink,
    hasGaugeAddress,
    gaugeAddress,
    chainId,
  }
}

export function hasNestedPools(pool: Pool) {
  // The following discriminator is needed because not all pools in GqlPoolQuery do have nestingType property
  // and the real TS discriminator is __typename which we don't want to use
  return 'nestingType' in pool && pool.nestingType !== GqlPoolNestingType.NoNesting
}

export function isNotSupported(pool: Pool) {
  return (
    hasNestedPools(pool) && 'nestingType' in pool && pool.nestingType === 'HAS_ONLY_PHANTOM_BPT'
  )
}

/**
 * Returns true if the gauge is claimable within this UI. We don't support
 * claiming for v1 gauges on child-chains because they are deprecated and don't
 * conform to the the same interface as v1 gauges on mainnet and v2 gauges on child-chains.
 */
export function isClaimableGauge(
  gauge: GqlPoolStakingGauge | GqlPoolStakingOtherGauge,
  chain: GqlChain | number
): boolean {
  return !(gauge.version === 1 && isNotMainnet(chain))
}

/**
 * Returns all gauge addresses for a pool that are claimable. See
 * `isClaimableGauge()` for info about why some gauges are not claimable.
 */
export function allClaimableGaugeAddressesFor(pool: ClaimablePool) {
  const addresses: Address[] = []
  const staking = pool.staking

  if (!staking?.gauge) return addresses

  if (isClaimableGauge(staking.gauge, pool.chain)) {
    addresses.push(staking.gauge.gaugeAddress as Address)
  }

  const otherGauges = staking.gauge?.otherGauges || []
  const otherClaimableGaugeAddresses = otherGauges
    .filter(gauge => isClaimableGauge(gauge, pool.chain))
    .map(g => g.gaugeAddress as Address)

  addresses.push(...otherClaimableGaugeAddresses)

  return addresses
}

export function hasReviewedRateProvider(token: GqlPoolTokenDetail): boolean {
  return (
    !!token.priceRateProvider &&
    !!token.priceRateProviderData &&
    token.priceRateProviderData.reviewed
  )
}

/**
 * Returns true if we should block the user from adding liquidity to the pool.
 * @see https://github.com/balancer/frontend-v3/issues/613#issuecomment-2149443249
 */
export function shouldBlockAddLiquidity(pool: Pool) {
  const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]

  // If pool is an LBP, we should block adding liquidity
  if (isLBP(pool.type)) return true

  return poolTokens.some(token => {
    // if token is not allowed - we should block adding liquidity
    if (!token.isAllowed) return true

    // if rateProvider is null - we consider it as zero address and not block adding liquidity
    if (isNil(token.priceRateProvider) || token.priceRateProvider === zeroAddress) return false

    // if rateProvider is the nested pool address - we consider it as safe
    if (token.priceRateProvider === token.nestedPool?.address) return false

    // if price rate provider is set but is not reviewed - we should block adding liquidity
    if (!hasReviewedRateProvider(token)) return true

    if (token.priceRateProviderData?.summary !== 'safe') return true

    return false
  })
}

export function isAffectedByCspIssue(pool: Pool) {
  return isAffectedBy(pool, PoolIssue.CspPoolVulnWarning)
}

function isAffectedBy(pool: Pool, poolIssue: PoolIssue) {
  const issues = getNetworkConfig(getChainId(pool.chain)).pools.issues
  const affectedPoolIds = issues[poolIssue] ?? []
  return affectedPoolIds.includes(pool.id.toLowerCase())
}

export function getVaultConfig(pool: Pool) {
  const networkConfig = getNetworkConfig(pool.chain)
  const vaultAddress =
    pool.protocolVersion === 3 && pool.chain === GqlChain.Sepolia
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        networkConfig.contracts.balancer.vaultV3!
      : networkConfig.contracts.balancer.vaultV2

  const balancerVaultAbi = pool.protocolVersion === 3 ? balancerV3VaultAbi : balancerV2VaultAbi

  return { vaultAddress, balancerVaultAbi }
}

export function isV1Pool(pool: Pool): boolean {
  return pool.protocolVersion === 1
}

export function isV2Pool(pool: Pool): boolean {
  return pool.protocolVersion === 2
}

export function isV3Pool(pool: Pool): boolean {
  return pool.protocolVersion === 3
}

export function getRateProviderWarnings(warnings: string[]) {
  return warnings.filter(warning => !isEmpty(warning))
}
