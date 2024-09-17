import { useMemo } from 'react'
import { Pool } from '../../pool/PoolProvider'
import { isVebalPool } from '../../pool/pool.helpers'
import { GqlPoolStakingType } from '@/lib/shared/services/api/generated/graphql'

export enum ExpandedPoolType {
  StakedBal = 'staked-bal',
  StakedAura = 'staked-aura',
  Unstaked = 'unstaked',
  Locked = 'locked',
  Unlocked = 'unlocked',
  Default = 'default',
}

export type ExpandedPoolInfo = Pool & {
  poolType: ExpandedPoolType
  poolPositionUsd: number
}

export function useExpandedPools(pools: Pool[]) {
  const expandedPools = useMemo(() => {
    const expandedPools: ExpandedPoolInfo[] = []

    pools.forEach(pool => {
      const isVeBal = isVebalPool(pool.id)

      const stakedBalancesBalUsd =
        pool.userBalance?.stakedBalances
          .filter(balance => balance.stakingType !== GqlPoolStakingType.Aura)
          .reduce((acc, balance) => acc + Number(balance.balanceUsd), 0) || 0

      const stakedBalancesAuraUsd =
        pool.userBalance?.stakedBalances
          .filter(balance => balance.stakingType === GqlPoolStakingType.Aura)
          .reduce((acc, balance) => acc + Number(balance.balanceUsd), 0) || 0

      const walletBalanceUsd = pool.userBalance?.walletBalanceUsd || 0

      if (stakedBalancesBalUsd > 0) {
        expandedPools.push({
          ...pool,
          poolType: isVeBal ? ExpandedPoolType.Locked : ExpandedPoolType.StakedBal,
          poolPositionUsd: stakedBalancesBalUsd,
        })
      }

      if (stakedBalancesAuraUsd > 0) {
        expandedPools.push({
          ...pool,
          poolType: ExpandedPoolType.StakedAura,
          poolPositionUsd: stakedBalancesAuraUsd,
        })
      }

      if (walletBalanceUsd > 0) {
        expandedPools.push({
          ...pool,
          poolType: isVeBal ? ExpandedPoolType.Unlocked : ExpandedPoolType.Unstaked,
          poolPositionUsd: walletBalanceUsd,
        })
      }

      if (stakedBalancesBalUsd === 0 && stakedBalancesAuraUsd === 0 && walletBalanceUsd === 0) {
        expandedPools.push({
          ...pool,
          poolType: ExpandedPoolType.Default,
          poolPositionUsd: 0,
        })
      }
    })

    return expandedPools
  }, [pools])

  return expandedPools
}
