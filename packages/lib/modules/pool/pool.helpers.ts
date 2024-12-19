/* eslint-disable max-len */
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
import {
  GqlChain,
  GqlNestedPool,
  GqlPoolBase,
  GqlPoolNestingType,
  GqlPoolStakingGauge,
  GqlPoolStakingOtherGauge,
  GqlPoolTokenDetail,
  GqlPoolType,
  GqlToken,
  GqlHook,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { bn } from '@repo/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { isEmpty, isNil, uniqBy } from 'lodash'
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
import { TokenCore, PoolListItem } from './pool.types'
import { Pool } from './PoolProvider'
import { isBeetsProject, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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

export function isBoosted(pool: PoolListItem | Pool) {
  return isV3Pool(pool) && pool.hasAnyAllowedBuffer // this means that the pool has at least one ERC4626 token with allowed buffer
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
  return allPoolTokens(pool).findIndex(token => isSameAddress(token.address, pool.address))
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

export function calcFutureUserShareOfPool(pool: Pool, bptAmount: BigNumber) {
  const userBalance = getUserTotalBalanceInt(pool)
  const poolBalance = calcPoolBalance(pool)

  const newUserBalance = bn(userBalance).plus(bn(bptAmount))
  const newPoolBalance = poolBalance.plus(bn(bptAmount))
  return bn(newUserBalance).div(newPoolBalance)
}

export function calcShareOfPool(pool: Pool, rawBalance: bigint) {
  const poolBalance = calcPoolBalance(pool)
  return bn(rawBalance).div(bn(poolBalance))
}

export function calcPoolBalance(pool: Pool) {
  return bn(parseUnits(pool.dynamicData.totalShares, BPT_DECIMALS))
}

export function getPoolHelpers(pool: Pool, chain: GqlChain) {
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
  return (
    ('nestingType' in pool && pool.nestingType !== GqlPoolNestingType.NoNesting) ||
    // stable pools don't have nestingType but they can have nested pools in v3
    pool.poolTokens.some(token => token.hasNestedPool)
  )
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
  return !!token.priceRateProvider && !!token.priceRateProviderData
}

export function hasRateProvider(token: GqlPoolTokenDetail): boolean {
  const hasNoPriceRateProvider =
    isNil(token.priceRateProvider) || // if null, we consider rate provider as zero address
    token.priceRateProvider === zeroAddress ||
    token.priceRateProvider === token.nestedPool?.address

  return !hasNoPriceRateProvider && !isNil(token.priceRateProviderData)
}

export function hasReviewedHook(hook: GqlHook): boolean {
  return !!hook.reviewData
}

export function hasHooks(pool: Pool): boolean {
  const nestedHooks = pool.poolTokens
    .filter(token => token.hasNestedPool)
    .map(token => token.nestedPool?.hook)

  return !![pool.hook, ...nestedHooks].filter(Boolean).length
}

// Emergency flag to block adds for all V3 pools
const shouldBlockV3PoolAdds = false

/**
 * Returns true if we should block the user from adding liquidity to the pool.
 * @see https://github.com/balancer/frontend-v3/issues/613#issuecomment-2149443249
 */
export function shouldBlockAddLiquidity(pool: Pool) {
  if (isV3Pool(pool) && shouldBlockV3PoolAdds) return true

  // avoid blocking Sepolia pools
  if (pool.chain === GqlChain.Sepolia) return false

  // don't add liquidity to the maBEETS pool thru the pool page
  //if (isBeetsProject && pool.id === PROJECT_CONFIG.corePoolId) return true

  const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]

  // If pool is an LBP, paused or in recovery mode, we should block adding liquidity
  if (isLBP(pool.type) || pool.dynamicData.isPaused || pool.dynamicData.isInRecoveryMode) {
    return true
  }

  if (pool.hook && (!hasReviewedHook(pool.hook) || pool.hook?.reviewData?.summary === 'unsafe')) {
    return true
  }

  return poolTokens.some(token => {
    // if token is not allowed - we should block adding liquidity
    if (!token.isAllowed && !isCowAmmPool(pool.type)) {
      return true
    }

    // if rateProvider is null - we consider it as zero address and not block adding liquidity
    if (isNil(token.priceRateProvider) || token.priceRateProvider === zeroAddress) return false

    // if rateProvider is the nested pool address - we consider it as safe
    if (token.priceRateProvider === token.nestedPool?.address) return false

    // if price rate provider is set but is not reviewed - we should block adding liquidity
    if (!hasReviewedRateProvider(token)) {
      return true
    }

    if (token.priceRateProviderData?.summary !== 'safe') {
      return true
    }

    return false
  })
}

/**
 *  TODO: improve the implementation to display all the blocking reasons instead of just the first one
 */
export function getPoolAddBlockedReason(pool: Pool): string {
  const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]

  if (isV3Pool(pool) && shouldBlockV3PoolAdds) return 'Adds are blocked for all V3 pools'

  if (isLBP(pool.type)) return 'LBP pool'
  if (pool.dynamicData.isPaused) return 'Paused pool'
  if (pool.dynamicData.isInRecoveryMode) return 'Pool in recovery'

  // don't add liquidity to the maBEETS pool thru the pool page
  // if (isBeetsProject && pool.id === PROJECT_CONFIG.corePoolId) {
  //   return 'Please manage your liquidity on the maBEETS page.'
  // }

  if (pool.hook && !hasReviewedHook(pool.hook)) {
    return 'Unreviewed hook'
  }

  if (pool.hook?.reviewData?.summary === 'unsafe') {
    return 'Unsafe hook'
  }

  for (const token of poolTokens) {
    // if token is not allowed - we should block adding liquidity
    if (!token.isAllowed && !isCowAmmPool(pool.type)) {
      return `Token: ${token.symbol} is not allowed` // TODO: Add instructions and link to get it approved
    }

    // if price rate provider is set but is not reviewed - we should block adding liquidity
    if (!hasReviewedRateProvider(token)) {
      return `Rate provider for token ${token.symbol} was not yet reviewed` // TODO: Add instructions and link to get it reviewed
    }

    if (token.priceRateProviderData?.summary !== 'safe') {
      return `Rate provider for token ${token.symbol} is not safe` // TODO: Add instructions and link to get it reviewed
    }
  }
  return ''
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
    pool.protocolVersion === 3
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

export function isV3Pool(pool: Pool | PoolListItem | GqlPoolBase): boolean {
  return pool.protocolVersion === 3
}

export function isV3WithNestedActionsPool(pool: Pool): boolean {
  return supportsNestedActions(pool) && isV3Pool(pool)
}

export function isV3NotSupportingWethIsEth(pool: Pool): boolean {
  return (supportsNestedActions(pool) || isBoosted(pool)) && isV3Pool(pool)
}

export function requiresPermit2Approval(pool: Pool): boolean {
  return isV3Pool(pool)
}

export function isUnbalancedLiquidityDisabled(pool: Pool): boolean {
  return !!pool.liquidityManagement?.disableUnbalancedLiquidity
}

export function getWarnings(warnings: string[]) {
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
  function toGqlTokens(tokens: PoolToken[] | TokenCore[]): GqlToken[] {
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

  if (isBoosted(pool)) {
    return getBoostedGqlTokens(pool, getToken)
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

// Returns true if the given token address belongs to a top level standard/underlying token that is not a nestedBpt
export function isStandardOrUnderlyingRootToken(pool?: Pool, tokenAddress?: Address): boolean {
  if (!pool || !tokenAddress) return true
  const token = pool.poolTokens.find(
    token =>
      isSameAddress(token.address, tokenAddress) ||
      isSameAddress(token.underlyingToken?.address || '', tokenAddress)
  )
  return token?.hasNestedPool === false
}

// Returns the top level tokens that is not nestedBpt
export function getStandardRootTokens(pool: Pool, poolActionableTokens?: GqlToken[]): GqlToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(token =>
    isStandardOrUnderlyingRootToken(pool, token.address as Address)
  )
}

// Returns the child tokens (children of a parent nestedBpt)
export function getChildTokens(pool: Pool, poolActionableTokens?: GqlToken[]): GqlToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(
    token => !isStandardOrUnderlyingRootToken(pool, token.address as Address)
  )
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
  if (
    !isStandardOrUnderlyingRootToken(pool, token1) &&
    !isStandardOrUnderlyingRootToken(pool, token2)
  ) {
    return false
  }
  return true
}

/*
  Returns all the tokens in the structure of the given pool:
  top level tokens + children nested tokens + ERC4626 underlying tokens.
 */
export function allPoolTokens(pool: Pool | GqlPoolBase): TokenCore[] {
  const extractUnderlyingTokens = (token: PoolToken): TokenCore[] => {
    if (shouldUseUnderlyingToken(token, pool)) {
      return [{ ...token.underlyingToken, index: token.index } as TokenCore]
    }
    return []
  }

  const extractNestedUnderlyingTokens = (nestedPool?: GqlNestedPool): TokenCore[] => {
    if (!nestedPool) return []
    return nestedPool.tokens.flatMap(nestedToken =>
      shouldUseUnderlyingToken(nestedToken, pool)
        ? ([
            nestedToken,
            { ...nestedToken.underlyingToken, index: nestedToken.index },
          ] as TokenCore[])
        : [nestedToken as TokenCore]
    )
  }

  const underlyingTokens: TokenCore[] = pool.poolTokens.flatMap(extractUnderlyingTokens)

  const nestedParentTokens: PoolToken[] = pool.poolTokens.flatMap(token =>
    token.nestedPool ? token : []
  )

  const nestedChildrenTokens: TokenCore[] = pool.poolTokens.flatMap(token =>
    token.nestedPool ? extractNestedUnderlyingTokens(token.nestedPool as GqlNestedPool) : []
  )

  const isTopLevelToken = (token: PoolToken): boolean => {
    if (token.hasNestedPool) return false
    if (!isV3Pool(pool)) return true
    if (!token.isErc4626) return true
    if (token.isErc4626 && !token.isBufferAllowed) return true
    return true
  }

  const standardTopLevelTokens: PoolToken[] = pool.poolTokens.flatMap(token =>
    isTopLevelToken(token) ? token : []
  )

  const allTokens = underlyingTokens.concat(
    toTokenCores(nestedParentTokens),
    nestedChildrenTokens,
    toTokenCores(standardTopLevelTokens)
  )

  // Remove duplicates as phantom BPTs can be both in the top level and inside nested pools
  return uniqBy(allTokens, 'address')
}

function shouldUseUnderlyingToken(token: PoolToken, pool: Pool | GqlPoolBase): boolean {
  if (isV3Pool(pool) && token.isErc4626 && token.isBufferAllowed && !token.underlyingToken) {
    // This should never happen unless the API some some inconsistency
    throw new Error(
      `Underlying token is missing for ERC4626 token with address ${token.address} in chain ${pool.chain}`
    )
  }
  // Only v3 pools should underlying tokens
  return isV3Pool(pool) && token.isErc4626 && token.isBufferAllowed && !!token.underlyingToken
}

// Returns top level standard tokens + Erc4626 (only v3) underlying tokens
export function getBoostedGqlTokens(pool: Pool, getToken: GetTokenFn): GqlToken[] {
  const underlyingTokens = pool.poolTokens
    .flatMap(token =>
      shouldUseUnderlyingToken(token, pool)
        ? [getToken(token.underlyingToken?.address as Address, pool.chain)]
        : toGqlTokens([token], getToken, pool.chain)
    )
    .filter((token): token is GqlToken => token !== undefined)
  return underlyingTokens
}

function toTokenCores(poolTokens: PoolToken[]): TokenCore[] {
  return poolTokens.map(
    t =>
      ({
        address: t.address as Address,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        index: t.index,
      }) as TokenCore
  )
}
