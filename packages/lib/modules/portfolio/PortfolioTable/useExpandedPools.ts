import { useMemo } from 'react'
import { Pool } from '../../pool/pool.types'
import { isVebalPool } from '../../pool/pool.helpers'
import { GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'

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
  uniqueKey: string
}

function generateUniqueKey(...args: string[]) {
  return args.join(' - ')
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
        const poolType = isVeBal ? ExpandedPoolType.Locked : ExpandedPoolType.StakedBal
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: stakedBalancesBalUsd,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }

      if (stakedBalancesAuraUsd > 0) {
        const poolType = ExpandedPoolType.StakedAura
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: stakedBalancesAuraUsd,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }

      if (walletBalanceUsd > 0) {
        const poolType = isVeBal ? ExpandedPoolType.Unlocked : ExpandedPoolType.Unstaked
        expandedPools.push({
          ...pool,
          poolType,
          poolPositionUsd: walletBalanceUsd,
          uniqueKey: generateUniqueKey(pool.id, poolType),
        })
      }

      if (stakedBalancesBalUsd === 0 && stakedBalancesAuraUsd === 0 && walletBalanceUsd === 0) {
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
