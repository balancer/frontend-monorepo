import { bn, safeSum, isValidNumber } from '@repo/lib/shared/utils/numbers'
import { Pool } from './pool.types'
import { PoolListItem } from './pool.types'
import { parseUnits } from 'viem'
import { BPT_DECIMALS } from './pool.constants'
import { HumanAmount } from '@balancer/sdk'
import type { GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlPoolStakingTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { hasNonPreferentialStakedBalance, hasPreferentialGauge } from './actions/stake.helpers'

export function calcStakedBalance(
  pool: Pool | PoolListItem,
  stakingType?: GqlPoolStakingType
): HumanAmount {
  const userBalance = pool.userBalance
  if (!userBalance) return '0'

  const filteredBalances = stakingType
    ? userBalance.stakedBalances.filter(stakedBalance => stakedBalance.stakingType === stakingType)
    : userBalance.stakedBalances

  return safeSum(
    filteredBalances.map(stakedBalance =>
      isValidNumber(stakedBalance.balance) ? bn(stakedBalance.balance) : bn(0)
    )
  ) as HumanAmount
}

export function calcTotalStakedBalance(pool: Pool | PoolListItem): HumanAmount {
  return calcStakedBalance(pool)
}

export function calcGaugeStakedBalance(pool: Pool | PoolListItem): HumanAmount {
  return calcStakedBalance(pool, GqlPoolStakingTypeValues.Gauge)
}

export function calcTotalStakedBalanceUsd(pool: Pool): number {
  const userBalance = pool.userBalance
  if (!userBalance) return 0

  return Number(
    safeSum(
      userBalance.stakedBalances.map(stakedBalance =>
        isValidNumber(stakedBalance.balanceUsd) ? bn(stakedBalance.balanceUsd) : bn(0)
      )
    )
  )
}

export function calcTotalStakedBalanceInt(pool: Pool): bigint {
  return parseUnits(bn(calcTotalStakedBalance(pool)).toFixed(), BPT_DECIMALS)
}

export function getUserTotalBalance(pool: Pool | PoolListItem): HumanAmount {
  const userBalance = pool.userBalance
  if (!userBalance) return '0'

  return isValidNumber(userBalance.totalBalance)
    ? (bn(userBalance.totalBalance).toFixed(18) as HumanAmount)
    : '0'
}

export function getUserWalletBalance(pool: Pool): HumanAmount {
  const userBalance = pool.userBalance
  if (!userBalance) return '0'

  return userBalance.walletBalance as HumanAmount
}

export function getUserWalletBalanceUsd(pool: Pool): number {
  const userBalance = pool.userBalance
  if (!userBalance) return 0

  return userBalance.walletBalanceUsd
}

export function getUserWalletBalanceInt(pool: Pool): bigint {
  return parseUnits(bn(getUserWalletBalance(pool)).toFixed(), BPT_DECIMALS)
}

export function getUserTotalBalanceUsd(pool: Pool | PoolListItem): number {
  const userBalance = pool.userBalance
  if (!userBalance || !userBalance.totalBalanceUsd) return 0

  return userBalance.totalBalanceUsd
}

export function getUserTotalBalanceInt(pool: Pool): bigint {
  // On removing liquidity from a CoW pool I was left with some dust. The
  // totalBalance (human amount) returned from the API doesn't seem to be limited to 18
  // decimals and so it borked the whole pool page. toFixed(18) ensures the
  // value cannot be more than 18 decimals when passed into parseUnits.
  const totalBalanceStr = getUserTotalBalance(pool)
  const totalBalance = isValidNumber(totalBalanceStr)
    ? bn(totalBalanceStr).toFixed(BPT_DECIMALS)
    : '0'
  return parseUnits(totalBalance, BPT_DECIMALS)
}

/*
   The api provides staked balances that, for now, we don't fetch onchain (FARMING, etc.)
   We need this "non onChain fetched staked balance" in the totalBalance calculation
*/
export function calcNonOnChainFetchedStakedBalance(pool: Pool): string {
  const userBalance = pool.userBalance
  if (!userBalance) return '0'

  const nonOnChainFetchedStakedBalances = userBalance.stakedBalances
    .filter(balance => balance.stakingType !== GqlPoolStakingTypeValues.Gauge)
    .map(stakedBalance => stakedBalance.balance)

  return safeSum(nonOnChainFetchedStakedBalances)
}

type StakedBalance = {
  balance: HumanAmount
  balanceUsd: number
}

export function getStakedBalance(pool: Pool, stakingType: GqlPoolStakingType): StakedBalance {
  const zeroStakedBalance = {
    balance: '0' as HumanAmount,
    balanceUsd: 0,
  }

  const userBalance = pool.userBalance
  if (!userBalance) return zeroStakedBalance

  const stakingAddress =
    stakingType === GqlPoolStakingTypeValues.Gauge ? pool.staking?.gauge?.id : undefined
  const stakedBalance = userBalance.stakedBalances.find(
    balance =>
      balance.stakingType === stakingType &&
      (balance.stakingId === stakingAddress || stakingType === GqlPoolStakingTypeValues.VeBal)
  )

  if (!stakedBalance) {
    return zeroStakedBalance
  }

  return {
    balance: stakedBalance.balance as HumanAmount,
    balanceUsd: stakedBalance.balanceUsd,
  }
}

export function calcStakedBalanceInt(pool: Pool, stakingType: GqlPoolStakingType) {
  return parseUnits(bn(getStakedBalance(pool, stakingType).balance).toFixed(), BPT_DECIMALS)
}

export function calcStakedBalanceUsd(pool: Pool, stakingType: GqlPoolStakingType): number {
  const balanceUsd = getStakedBalance(pool, stakingType).balanceUsd
  return isValidNumber(balanceUsd) ? Number(bn(balanceUsd)) : 0
}

export function calcGaugeStakedBalanceUsd(pool: Pool): number {
  return calcStakedBalanceUsd(pool, GqlPoolStakingTypeValues.Gauge)
}

export function hasTotalBalance(pool: Pool) {
  const totalBalance = getUserTotalBalance(pool)
  return isValidNumber(totalBalance) && bn(totalBalance).gt(0)
}

export function hasBalancerStakedBalance(pool: Pool | PoolListItem): boolean {
  return hasStakedBalanceFor(pool, GqlPoolStakingTypeValues.Gauge)
}

export function hasVeBalStaking(pool: Pool | PoolListItem): boolean {
  return hasStakingType(pool, GqlPoolStakingTypeValues.VeBal)
}

export function hasStakedBalanceFor(
  pool: Pool | PoolListItem,
  stakingType: GqlPoolStakingType
): boolean {
  const userBalance = pool.userBalance
  if (!userBalance) return false

  return userBalance.stakedBalances.some(
    balance =>
      balance.stakingType === stakingType &&
      isValidNumber(balance.balance) &&
      bn(balance.balance).gt(0)
  )
}

export function hasStakingType(
  pool: Pool | PoolListItem,
  stakingType: GqlPoolStakingType
): boolean {
  const userBalance = pool.userBalance
  if (!userBalance) return false

  return userBalance.stakedBalances.some(balance => balance.stakingType === stakingType)
}

export function hasTinyBalance(pool: Pool | PoolListItem, minUsdBalance = 0.01): boolean {
  const userBalance = pool.userBalance
  if (!userBalance) return false
  return bn(getUserTotalBalanceUsd(pool)).lt(minUsdBalance)
}

export function shouldMigrateStake(pool: Pool): boolean {
  const hasNonPreferentialBalance = hasNonPreferentialStakedBalance(pool)
  return hasPreferentialGauge(pool) && hasNonPreferentialBalance
}
