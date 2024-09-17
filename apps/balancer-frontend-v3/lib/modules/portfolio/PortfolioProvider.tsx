'use client'

import { GetPoolsDocument } from '@/lib/shared/services/api/generated/graphql'
import { useQuery as useApolloQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { createContext, useCallback, useMemo } from 'react'
import { useProtocolRewards } from './PortfolioClaim/useProtocolRewards'
import { ClaimableReward, useClaimableBalances } from './PortfolioClaim/useClaimableBalances'
import { BalTokenReward, useBalTokenRewards } from './PortfolioClaim/useBalRewards'
import { bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { useUserAccount } from '../web3/UserAccountProvider'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { useOnchainUserPoolBalances } from '../pool/queries/useOnchainUserPoolBalances'
import { Pool } from '../pool/PoolProvider'
import { useRecentTransactions } from '../transactions/RecentTransactionsProvider'
import { isAfter } from 'date-fns'
import { compact, uniq, uniqBy } from 'lodash'
import {
  calcTotalStakedBalance,
  getUserTotalBalance,
  getUserTotalBalanceUsd,
} from '../pool/user-balance.helpers'
import { getTimestamp } from '@/lib/shared/utils/time'

export interface ClaimableBalanceResult {
  status: 'success' | 'error'
  result: bigint
}

export type PoolRewardsData = Pool & {
  balReward?: BalTokenReward
  claimableRewards?: ClaimableReward[]
  totalFiatClaimBalance?: BigNumber
}

export type PoolRewardsDataMap = Record<string, PoolRewardsData>

export type UsePortfolio = ReturnType<typeof _usePortfolio>

function _usePortfolio() {
  const { userAddress, isConnected } = useUserAccount()
  const { transactions } = useRecentTransactions()

  const fiveMinutesAgo = getTimestamp().minsAgo(5)
  const chainIn = getProjectConfig().supportedNetworks

  // filter in recent transactions that took place in the last 5 minutes
  const transactionsWithPoolIds = Object.values(transactions).filter(
    tx => isAfter(tx.timestamp, fiveMinutesAgo) && tx.poolId
  )

  const idIn = uniq(compact(transactionsWithPoolIds.map(tx => tx.poolId)))

  // fetch pools with a user balance
  const { data: poolsUserAddressData, loading: isLoadingPoolsUserAddress } = useApolloQuery(
    GetPoolsDocument,
    {
      variables: {
        where: {
          userAddress: userAddress?.toLowerCase(),
          chainIn,
        },
      },
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
      skip: !isConnected || !userAddress,
    }
  )

  // fetch pools with an id in recent transactions
  const { data: poolsIdData, loading: isLoadingPoolsId } = useApolloQuery(GetPoolsDocument, {
    variables: {
      where: {
        idIn,
        chainIn,
      },
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    skip: !isConnected || idIn.length === 0,
  })

  const poolsData = uniqBy(
    [...(poolsUserAddressData?.pools || []), ...(poolsIdData?.pools || [])],
    'id'
  )

  const { data: poolsWithOnchainUserBalances, isLoading: isLoadingOnchainUserBalances } =
    useOnchainUserPoolBalances((poolsData as unknown as Pool[]) || [])

  const portfolioData = useMemo(() => {
    if (!isConnected || !userAddress) {
      return {
        pools: [],
        stakedPools: [],
        unstakedPools: [],
        userTotalBalance: bn(0),
      }
    }

    const stakedPools: Pool[] = []
    const unstakedPools: Pool[] = []
    let userTotalBalance = bn(0)

    poolsWithOnchainUserBalances.forEach(pool => {
      if (pool.userBalance && pool.userBalance.totalBalance === '0') return

      const stakedBalance = bn(calcTotalStakedBalance(pool))
      const poolTotalBalance = bn(getUserTotalBalance(pool))
      const unstakedBalance = poolTotalBalance.minus(stakedBalance)
      const isStaked = stakedBalance.gt(0)
      const isUnstaked = unstakedBalance.gt(0)

      if (isStaked) {
        stakedPools.push(pool)
      }
      if (isUnstaked) {
        unstakedPools.push(pool)
      }

      userTotalBalance = userTotalBalance.plus(getUserTotalBalanceUsd(pool))
    })

    return {
      pools:
        poolsWithOnchainUserBalances.filter(
          pool => pool.userBalance && pool.userBalance.totalBalance !== '0'
        ) || [],
      stakedPools,
      unstakedPools,
      userTotalBalance,
    }
  }, [poolsWithOnchainUserBalances, isConnected, userAddress])

  // Bal token rewards
  const { balRewardsData, refetchBalRewards, isLoadingBalRewards } = useBalTokenRewards(
    portfolioData.stakedPools || []
  )

  // Protocol rewards
  const { protocolRewardsData, isLoadingProtocolRewards, refetchProtocolRewards } =
    useProtocolRewards()

  // Other tokens rewards
  const {
    claimableRewards,
    refetchClaimableRewards,
    claimableRewardsByPoolMap,
    isLoadingClaimableRewards,
  } = useClaimableBalances(portfolioData.stakedPools || [])

  const poolRewardsMap = useMemo(() => {
    return portfolioData.stakedPools?.reduce((acc: PoolRewardsDataMap, pool) => {
      const balReward = balRewardsData.find(r => r.pool.id === pool.id)
      const claimableReward = claimableRewardsByPoolMap[pool.id]

      acc[pool.id] = {
        ...pool,
      }

      let totalFiatClaimableBalance = bn(0)
      if (balReward) {
        acc[pool.id].balReward = balReward
        totalFiatClaimableBalance = totalFiatClaimableBalance.plus(balReward.fiatBalance)
      }
      if (claimableReward) {
        acc[pool.id].claimableRewards = claimableReward
        claimableReward.forEach(
          r => (totalFiatClaimableBalance = totalFiatClaimableBalance.plus(r.fiatBalance))
        )
      }

      acc[pool.id].totalFiatClaimBalance = totalFiatClaimableBalance
      return acc
    }, {})
  }, [portfolioData.stakedPools, balRewardsData, claimableRewardsByPoolMap])

  const rewardsByChainMap = useMemo(() => {
    return portfolioData.stakedPools?.reduce((acc: Record<string, PoolRewardsData[]>, pool) => {
      const poolReward = poolRewardsMap[pool.id]
      const poolRewards = poolReward ? [poolReward] : []
      if (!acc[pool.chain]) acc[pool.chain] = []
      acc[pool.chain].push(...poolRewards)
      return acc
    }, {})
  }, [portfolioData.stakedPools, poolRewardsMap])

  const poolsByChainMap = useMemo(() => {
    return portfolioData.stakedPools?.reduce((acc: Record<string, Pool[]>, pool) => {
      if (!acc[pool.chain]) acc[pool.chain] = []
      acc[pool.chain].push(pool)
      return acc
    }, {})
  }, [portfolioData.stakedPools])

  const totalFiatClaimableBalance = useMemo(() => {
    return portfolioData.stakedPools?.reduce((acc, pool) => {
      return acc.plus(poolRewardsMap[pool.id]?.totalFiatClaimBalance || 0)
    }, bn(0))
  }, [portfolioData.stakedPools, poolRewardsMap])

  const totalFiatClaimableBalanceByChain = useMemo(() => {
    return Object.entries(poolsByChainMap).reduce(
      (acc: Record<string, BigNumber>, [chain, pools]) => {
        const sum = pools.reduce((total, pool) => {
          return total.plus(poolRewardsMap[pool.id]?.totalFiatClaimBalance || 0)
        }, bn(0))

        acc[chain] = sum

        return acc
      },
      {}
    )
  }, [poolsByChainMap, poolRewardsMap])

  const protocolRewardsBalance = useMemo(() => {
    return protocolRewardsData.reduce((acc, reward) => {
      acc = acc.plus(reward.fiatBalance)
      return acc
    }, bn(0))
  }, [protocolRewardsData])

  const refetchClaimPoolData = useCallback(() => {
    refetchBalRewards()
    refetchClaimableRewards()
  }, [refetchBalRewards, refetchClaimableRewards])

  return {
    portfolioData,
    balRewardsData,
    protocolRewardsData,
    claimableRewards,
    poolRewardsMap,
    poolsByChainMap,
    poolsWithOnchainUserBalances,
    totalFiatClaimableBalance,
    totalFiatClaimableBalanceByChain,
    protocolRewardsBalance,
    rewardsByChainMap,
    refetchClaimPoolData,
    refetchProtocolRewards,
    isLoadingBalRewards,
    isLoadingProtocolRewards,
    isLoadingClaimableRewards,
    isLoadingPortfolio:
      isLoadingPoolsUserAddress || isLoadingOnchainUserBalances || isLoadingPoolsId,
    isLoadingRewards: isLoadingBalRewards || isLoadingClaimableRewards || isLoadingProtocolRewards,
  }
}

export const PortfolioContext = createContext<UsePortfolio | null>(null)

interface PortfolioProviderProps {
  children: React.ReactNode
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const hook = _usePortfolio()
  return <PortfolioContext.Provider value={hook}>{children}</PortfolioContext.Provider>
}

export const usePortfolio = (): UsePortfolio => useMandatoryContext(PortfolioContext, 'Provider')
