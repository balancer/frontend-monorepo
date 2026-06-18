import { useMemo } from 'react'
import { Pool } from '../../pool/pool.types'
import { isVebalPool } from '../../pool/pool.helpers'
import { getCanStake } from '../../pool/actions/stake.helpers'
import { GqlPoolStakingTypeValues } from '@repo/lib/shared/services/api/generated/graphql-enums'

export enum ExpandedPoolType {
  StakedBal = 'staked-bal',
  Unstaked = 'unstaked',
  Locked = 'locked',
  Unlocked = 'unlocked',
  Default = 'default',
}

export type ExpandedPoolInfo = Pool & {
  poolType: ExpandedPoolType
  poolPositionUsd: number
  uniqueKey: string
}

function generateUniqueKey(...args: string[]) {
  return args.join(' - ')
}

export const StakingFilterKey = {
  Staked: 'Staked',
  Locked: 'Locked',
  Unlocked: 'Unlocked',
  Unstaked: 'Unstaked',
  Default: 'Default',
} as const

export type StakingFilterKeyType = (typeof StakingFilterKey)[keyof typeof StakingFilterKey]

// Maps UI filter keys to the actual pool types they represent
export const STAKING_FILTER_MAP: Record<StakingFilterKeyType, ExpandedPoolType[]> = {
  [StakingFilterKey.Staked]: [ExpandedPoolType.StakedBal],
  [StakingFilterKey.Locked]: [ExpandedPoolType.Locked],
  [StakingFilterKey.Unlocked]: [ExpandedPoolType.Unlocked],
  [StakingFilterKey.Unstaked]: [ExpandedPoolType.Unstaked],
  [StakingFilterKey.Default]: [ExpandedPoolType.Default],
}

// Maps UI filter keys to their display labels
export const STAKING_LABEL_MAP: Record<StakingFilterKeyType, string> = {
  [StakingFilterKey.Staked]: 'Staked',
  [StakingFilterKey.Locked]: 'Locked',
  [StakingFilterKey.Unlocked]: 'Unlocked',
  [StakingFilterKey.Unstaked]: 'Unstaked',
  [StakingFilterKey.Default]: 'N/A',
}

export function useExpandedPools(pools: Pool[]) {
  const expandedPools = useMemo(() => {
    const expandedPools: ExpandedPoolInfo[] = []

    pools.forEach(pool => {
      const isVeBal = isVebalPool(pool.id)

      const stakedBalancesBalUsd =
        pool.userBalance?.stakedBalances
          ?.filter(balance =>
            [
              GqlPoolStakingTypeValues.Gauge,
              GqlPoolStakingTypeValues.VeBal,
              GqlPoolStakingTypeValues.FreshBeets,
            ].includes(balance.stakingType)
          )
          .reduce((acc, balance) => acc + Number(balance.balanceUsd), 0) || 0

      const walletBalanceUsd = pool.userBalance?.walletBalanceUsd || 0

      if (stakedBalancesBalUsd > 0) {
        const poolType = isVeBal ? ExpandedPoolType.Locked : ExpandedPoolType.StakedBal
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: stakedBalancesBalUsd,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }

      if (walletBalanceUsd > 0) {
        const canStake = getCanStake(pool)
        const poolType = canStake
          ? isVeBal
            ? ExpandedPoolType.Unlocked
            : ExpandedPoolType.Unstaked
          : ExpandedPoolType.Default
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: walletBalanceUsd,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }

      if (stakedBalancesBalUsd === 0 && walletBalanceUsd === 0) {
        const poolType = ExpandedPoolType.Default
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: 0,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }
    })

    return expandedPools
  }, [pools])

  return expandedPools
}
