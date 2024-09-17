import { getChainId } from '@/lib/config/app.config'
import { bn } from '@/lib/shared/utils/numbers'
import { compact, keyBy } from 'lodash'
import { Address, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { balancerV2WeightedPoolV4Abi } from '../../web3/contracts/abi/generated'
import { Pool } from '../PoolProvider'
import { BPT_DECIMALS } from '../pool.constants'
import { calcBptPrice } from '../pool.helpers'
import { useMemo } from 'react'

export type UnstakedBalanceByPoolId = ReturnType<
  typeof useUserUnstakedBalance
>['unstakedBalanceByPoolId']

export function useUserUnstakedBalance(pools: Pool[] = []) {
  const { userAddress, isConnected } = useUserAccount()

  // All pools should implement balanceOf so we take this abi that should work for v2 and v3 pools
  const poolAbi = balancerV2WeightedPoolV4Abi

  const {
    data: unstakedPoolBalances = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: isConnected,
    },
    contracts: pools.map(
      pool =>
        ({
          abi: poolAbi,
          address: pool.address as Address,
          functionName: 'balanceOf',
          args: [userAddress as Address],
          chainId: getChainId(pool.chain),
        } as const)
    ),
  })

  // for each pool get the unstaked balance
  const balances = useMemo(() => {
    if (isFetching) return []

    return compact(
      unstakedPoolBalances.map((rawBalance, index) => {
        const pool = pools[index]
        if (!pool) return undefined

        const bptPrice = calcBptPrice(pool.dynamicData.totalLiquidity, pool.dynamicData.totalShares)
        const humanUnstakedBalance = formatUnits(rawBalance || 0n, BPT_DECIMALS)

        return {
          poolId: pool.id,
          rawUnstakedBalance: rawBalance,
          unstakedBalance: humanUnstakedBalance,
          unstakedBalanceUsd: bn(humanUnstakedBalance).times(bptPrice),
        }
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, unstakedPoolBalances, pools, userAddress, isFetching])

  const unstakedBalanceByPoolId = keyBy(balances, 'poolId')

  return {
    unstakedBalanceByPoolId,
    isLoading,
    isFetching,
    refetch,
    error,
  }
}
