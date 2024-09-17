import { getChainId } from '@/lib/config/app.config'
import {
  GqlPoolStakingType,
  GqlUserStakedBalance,
} from '@/lib/shared/services/api/generated/graphql'
import { bn } from '@/lib/shared/utils/numbers'
import { compact, groupBy } from 'lodash'
import { Address, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { balancerV2GaugeV5Abi } from '../../web3/contracts/abi/generated'
import { Pool } from '../PoolProvider'
import { BPT_DECIMALS } from '../pool.constants'
import { calcBptPrice } from '../pool.helpers'
import { useMemo } from 'react'

export type StakedBalancesByPoolId = ReturnType<
  typeof useUserStakedBalance
>['stakedBalancesByPoolId']

export function useUserStakedBalance(pools: Pool[] = []) {
  const { userAddress, isConnected } = useUserAccount()
  const poolByStaking = createPoolByStakingRecord(pools)
  const contracts = poolContracts(poolByStaking, userAddress)

  const {
    data: stakedPoolBalances = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useReadContracts({
    query: { enabled: isConnected },
    allowFailure: false,
    contracts,
  })

  // for each pool replicate APIs GqlPoolUserBalance.stakedBalances api's type
  const stakedBalances = useMemo(() => {
    if (isFetching) return []

    return compact(
      stakedPoolBalances.map((rawBalance, index) => {
        const stakingAddress = contracts[index]?.address
        if (!stakingAddress) return undefined
        const pool = poolByStaking[stakingAddress]
        if (!pool) return undefined

        const bptPrice = calcBptPrice(pool.dynamicData.totalLiquidity, pool.dynamicData.totalShares)
        const humanStakedBalance = formatUnits(rawBalance || 0n, BPT_DECIMALS)

        const stakingType =
          stakingAddress === pool.staking?.aura?.auraPoolAddress
            ? GqlPoolStakingType.Aura
            : GqlPoolStakingType.Gauge

        const stakedBalance: GqlUserStakedBalance = {
          __typename: 'GqlUserStakedBalance',
          stakingId: stakingAddress,
          balance: humanStakedBalance,
          balanceUsd: bn(humanStakedBalance).times(bptPrice).toNumber(),
          stakingType,
        }

        return {
          poolId: pool.id,
          ...stakedBalance,
        }
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakedPoolBalances, contracts, poolByStaking, userAddress, isFetching])

  const stakedBalancesByPoolId = groupBy(stakedBalances, 'poolId')

  // return empty results for pools without stakings
  pools.forEach(pool => {
    if (!stakedBalancesByPoolId[pool.id]) {
      stakedBalancesByPoolId[pool.id] = []
    }
  })

  return {
    stakedBalancesByPoolId,
    isLoading,
    isFetching,
    refetch,
    error,
  }
}

/*
  Builds the contracts array for the useReadContracts hook.
  One contract call for each stakingAddress in a pool.
*/
function poolContracts(poolByStaking: Record<Address, Pool>, userAddress: Address) {
  // All staking should implement balanceOf so we take this abi that should work for v2 & v3 pools and also for Aura pools
  const stakingAbi = balancerV2GaugeV5Abi

  const stakingAddresses = Object.keys(poolByStaking) as Address[]
  return compact(
    stakingAddresses.map(stakingAddress => {
      const pool = poolByStaking[stakingAddress]

      if (!pool) return undefined

      return {
        abi: stakingAbi,
        address: stakingAddress,
        functionName: 'balanceOf',
        args: [userAddress],
        chainId: getChainId(pool.chain),
      } as const
    })
  )
}

function createPoolByStakingRecord(pools: Pool[]): Record<Address, Pool> {
  return pools.reduce((acc, pool) => {
    const stakingAddresses = getStakingAddresses(pool)
    stakingAddresses.forEach(stakingAddress => {
      acc[stakingAddress] = pool
    })
    return acc
  }, {} as Record<Address, Pool>)
}

function getStakingAddresses(pool: Pool): Address[] {
  const preferentialGaugeAddress = pool.staking?.gauge?.gaugeAddress as Address
  const auraPoolAddress = pool.staking?.aura?.auraPoolAddress as Address
  const nonPreferentialGaugeAddresses =
    pool.staking?.gauge?.otherGauges?.map(otherGauge => otherGauge.gaugeAddress as Address) || []
  const stakingAddresses = [
    auraPoolAddress,
    preferentialGaugeAddress,
    ...nonPreferentialGaugeAddresses,
  ].filter(Boolean)
  return stakingAddresses
}
