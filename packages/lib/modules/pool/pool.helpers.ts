/* eslint-disable max-len */
import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import {
  GqlChain,
  GqlHookType,
  GqlPoolBase,
  GqlPoolNestingType,
  GqlPoolStakingGauge,
  GqlPoolStakingOtherGauge,
  GqlPoolTokenDetail,
  GqlPoolType,
  HookFragment,
} from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { bn } from '@repo/lib/shared/utils/numbers'
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
import { vaultV3Abi } from '@balancer/sdk'
import { PoolListItem, Pool, PoolCore } from './pool.types'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { allPoolTokens, isStandardOrUnderlyingRootToken } from './pool-tokens.utils'

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

export function isMaBeetsPool(poolId: string): boolean {
  return (
    poolId.toLowerCase() === '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005'
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
  if (!pool.poolTokens) return false
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

export function hasReviewedHook(hook: HookFragment): boolean {
  return !!hook.reviewData
}

export function hasHooks(pool: Pool): boolean {
  const nestedHooks = pool.poolTokens
    .filter(token => token.hasNestedPool)
    .map(token => token.nestedPool?.hook)

  return !![pool.hook, ...nestedHooks].filter(Boolean).length
}

export function hasStableSurgeHook(pool: Pool): boolean {
  return hasHookType(pool, GqlHookType.StableSurge)
}

export function hasHookType(pool: Pool, hookType: GqlHookType): boolean {
  const nestedHooks = pool.poolTokens.flatMap(token =>
    token.nestedPool ? token.nestedPool.hook : []
  )
  const hooks = [...(pool.hook ? [pool.hook] : []), ...nestedHooks]

  return hooks.some(hook => hook && hook.type === hookType)
}

export function hasReviewedErc4626(token: GqlPoolTokenDetail): boolean {
  return token.isErc4626 && !!token.erc4626ReviewData
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

  // block add liquidity for custom scenarios eg. maBEETS
  if (isMaBeetsPool(pool.id)) return true

  // If pool is an LBP, paused or in recovery mode, we should block adding liquidity
  if (isLBP(pool.type) || pool.dynamicData.isPaused || pool.dynamicData.isInRecoveryMode) {
    return true
  }

  if (pool.hook && (!hasReviewedHook(pool.hook) || pool.hook?.reviewData?.summary === 'unsafe')) {
    return true
  }

  const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]

  return poolTokens.some(token => {
    // if token is not allowed - we should block adding liquidity
    if (isV2Pool(pool) && !token.isAllowed) {
      return true
    }

    // if rateProvider is null - we consider it as zero address and not block adding liquidity
    if (isNil(token.priceRateProvider) || token.priceRateProvider === zeroAddress) return false

    // if rateProvider is the nested pool address - we consider it as safe
    if (token.priceRateProvider === token.nestedPool?.address) return false

    // if price rate provider is set but is not reviewed or summary is not safe - we should block adding liquidity
    if (!hasReviewedRateProvider(token) || token.priceRateProviderData?.summary !== 'safe') {
      return true
    }

    /* Only for actual v3 boosted pools (ERC4626 with useUnderlyingForAddRemove === true):
      if ERC4626 is not reviewed or summary is not safe - we should block adding liquidity
    */
    if (
      isV3Pool(pool) &&
      pool.hasAnyAllowedBuffer &&
      token.isErc4626 &&
      token.useUnderlyingForAddRemove &&
      (!hasReviewedErc4626(token) || token.erc4626ReviewData?.summary !== 'safe')
    ) {
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

  // reason for blocking in custom scenarios eg. maBEETS
  if (isMaBeetsPool(pool.id)) {
    return 'Please manage your liquidity on the maBEETS page.'
  }

  if (pool.hook && !hasReviewedHook(pool.hook)) {
    return 'Unreviewed hook'
  }

  if (pool.hook?.reviewData?.summary === 'unsafe') {
    return 'Unsafe hook'
  }

  for (const token of poolTokens) {
    // if token is not allowed - we should block adding liquidity
    if (isV2Pool(pool) && !token.isAllowed) {
      return `Token: ${token.symbol} is not allowed` // TODO: Add instructions and link to get it approved
    }

    // if price rate provider is set but is not reviewed - we should block adding liquidity
    if (!hasReviewedRateProvider(token)) {
      return `Rate provider for token ${token.symbol} was not yet reviewed` // TODO: Add instructions and link to get it reviewed
    }

    if (token.priceRateProviderData?.summary !== 'safe') {
      return `Rate provider for token ${token.symbol} is not safe` // TODO: Add instructions and link to get it reviewed
    }

    if (
      isV3Pool(pool) &&
      pool.hasAnyAllowedBuffer &&
      token.isErc4626 &&
      token.useUnderlyingForAddRemove
    ) {
      if (!hasReviewedErc4626(token)) {
        return `Tokenized vault for token ${token.symbol} was not yet reviewed`
      }

      if (token.erc4626ReviewData?.summary !== 'safe') {
        return `Tokenized vault for token ${token.symbol} is not safe`
      }
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

type PoolWithProtocolVersion = Pick<PoolCore, 'protocolVersion'>

export function isV1Pool(pool: PoolWithProtocolVersion): boolean {
  return pool.protocolVersion === 1
}

export function isV2Pool(pool: PoolWithProtocolVersion): boolean {
  return pool.protocolVersion === 2
}

export function isV3Pool(pool: PoolWithProtocolVersion): boolean {
  return pool.protocolVersion === 3
}

export function isV3WithNestedActionsPool(pool: Pool): boolean {
  return supportsNestedActions(pool) && isV3Pool(pool)
}

export function supportsWethIsEth(pool: Pool): boolean {
  /*
    Currently all SDK handlers support wethIsEth
    and Cow AMM pools is the only scenario that doesn't support wethIsEth
  */
  return !isCowAmmPool(pool.type) && !pool.hasErc4626 && !pool.hasNestedErc4626
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
