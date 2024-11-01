/* eslint-disable max-len */
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
import {
  GetPoolQuery,
  GqlChain,
  GqlPoolBase,
  GqlPoolNestingType,
  GqlPoolStakingGauge,
  GqlPoolStakingOtherGauge,
  GqlPoolTokenDetail,
  GqlPoolType,
  GqlToken,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Numberish, bn } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { isEmpty, isNil } from 'lodash'
import { Address, getAddress, parseUnits, zeroAddress } from 'viem'
import { BPT_DECIMALS } from './pool.constants'
import { isNotMainnet } from '../chains/chain.utils'
import { ClaimablePool } from './actions/claim/ClaimProvider'
import { PoolIssue } from './alerts/pool-issues/PoolIssue.type'
import { getUserTotalBalanceInt } from './user-balance.helpers'
import { dateToUnixTimestamp } from '@repo/lib/shared/utils/time'
import { balancerV2VaultAbi } from '../web3/contracts/abi/generated'
import { supportsNestedActions } from './actions/LiquidityActionHelpers'
import { getLeafTokens, PoolToken } from '../tokens/token.helpers'
import { GetTokenFn } from '../tokens/TokensProvider'
import { vaultV3Abi } from '@balancer/sdk'

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
  // avoid blocking Sepolia pools
  if (pool.chain === GqlChain.Sepolia) return false

  const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]

  // If pool is an LBP, paused or in recovery mode, we should block adding liquidity
  if (isLBP(pool.type) || pool.dynamicData.isPaused || pool.dynamicData.isInRecoveryMode) {
    return true
  }

  return poolTokens.some(token => {
    // if token is not allowed - we should block adding liquidity
    if (!token.isAllowed && !isCowAmmPool(pool.type)) return true

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

  const balancerVaultAbi = pool.protocolVersion === 3 ? vaultV3Abi : balancerV2VaultAbi

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

export function requiresPermit2Approval(pool: Pool): boolean {
  return isV3Pool(pool)
}

export function isUnbalancedLiquidityDisabled(pool: Pool): boolean {
  return !!pool.liquidityManagement?.disableUnbalancedLiquidity
}

export function getRateProviderWarnings(warnings: string[]) {
  return warnings.filter(warning => !isEmpty(warning))
}

/*
  Depending on the pool type, iterates pool.poolTokens and returns the list of GqlTokens that can be used in the pool's actions (add/remove/swap).

  For instance:
    If the pool supports nested actions, returns the leaf tokens.
    If the pool is boosted, returns the underlying tokens instead of the ERC4626 tokens.
*/
export function getPoolActionableTokens(pool: Pool, getToken: GetTokenFn): GqlToken[] {
  type PoolToken = Pool['poolTokens'][0]
  function toGqlTokens(tokens: PoolToken[]): GqlToken[] {
    return tokens
      .filter(token => !isSameAddress(token.address, pool.address)) // Exclude the BPT pool token itself
      .map(token => getToken(token.address, pool.chain))
      .filter((token): token is GqlToken => token !== undefined)
  }

  // TODO add exception for composable pools where we can allow adding
  // liquidity with nested tokens
  if (supportsNestedActions(pool)) {
    return toGqlTokens(getLeafTokens(pool.poolTokens))
  }

  return toGqlTokens(pool.poolTokens)
}

export function getNonBptTokens(pool: Pool) {
  return pool.poolTokens.filter(token => !token.nestedPool)
}

export function getNestedBptTokens(poolTokens: PoolToken[]) {
  return poolTokens.filter(token => token.nestedPool)
}

// Returns the parent BPT token whose nested tokens include the given child token address
export function getNestedBptParentToken(poolTokens: PoolToken[], childTokenAddress: Address) {
  const nestedBptToken = getNestedBptTokens(poolTokens).find(token =>
    token.nestedPool?.tokens.some(nestedToken =>
      isSameAddress(nestedToken.address, childTokenAddress)
    )
  )
  if (!nestedBptToken) {
    throw new Error(
      `Provided nestedTokenAddress ${childTokenAddress} does not belong to any underlying token amongst the nested pool/s (${getNestedBptTokens(
        poolTokens
      )
        .map(t => t.symbol)
        .join(' ,')})`
    )
  }

  return nestedBptToken
}

// Returns true if the given token address belongs to a top level token that is not a nestedBpt
export function isStandardRootToken(pool?: Pool, tokenAddress?: Address): boolean {
  if (!pool || !tokenAddress) return true
  const token = pool.poolTokens.find(token => isSameAddress(token.address, tokenAddress))
  return token?.hasNestedPool === false
}

// Returns the top level tokens that is not nestedBpt
export function getStandardRootTokens(pool: Pool, poolActionableTokens?: GqlToken[]): GqlToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(token => isStandardRootToken(pool, token.address as Address))
}

// Returns the child tokens (children of a parent nestedBpt)
export function getChildTokens(pool: Pool, poolActionableTokens?: GqlToken[]): GqlToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(token => !isStandardRootToken(pool, token.address as Address))
}

export function toGqlTokens(
  poolTokens: PoolToken[],
  getToken: GetTokenFn,
  chain: GqlChain
): GqlToken[] {
  return poolTokens
    .map(token => getToken(token.address, chain))
    .filter((token): token is GqlToken => token !== undefined)
}

/*
  Allowed pool swaps:
    1. From a standard root token to another standard root token
    2. From a standard root token to a nested child token
    3. From a nested child token to a standard root token
  Disallowed pool swaps:
    1. From a nested child token to another nested child token
*/
export function isPoolSwapAllowed(pool: Pool, token1: Address, token2: Address): boolean {
  if (isStandardRootToken(pool, token1) && isStandardRootToken(pool, token2)) return false
  if (!isStandardRootToken(pool, token1) && !isStandardRootToken(pool, token2)) return false
  return true
}
