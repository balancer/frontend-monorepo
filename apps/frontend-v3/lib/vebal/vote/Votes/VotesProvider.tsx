'use client'

import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isVotingTimeLocked, sharesToBps } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { sumBy } from 'lodash'
import { useVebalLockInfo } from '@bal/lib/vebal/useVebalLockInfo'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { useExpiredGauges } from '@bal/lib/vebal/vote/useExpiredGaugesQuery'
import { useVoteMarketIncentives } from '@repo/lib/shared/services/votemarket/useVoteMarketIncentives'
import { isGaugeExpired } from '@repo/lib/modules/vebal/vote/vote.helpers'
import { filterVotingPoolsForAnvilFork } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export interface UseVotesArgs {
  data: GetVeBalVotingListQuery | undefined
  votingListLoading?: boolean
  error?: any
}

export function useVotesLogic({ data, votingListLoading = false, error }: UseVotesArgs) {
  const { userAddress } = useUserAccount()

  const votingList = useMemo(() => {
    const votingPools = data?.veBalGetVotingList || []
    return shouldUseAnvilFork ? filterVotingPoolsForAnvilFork(votingPools) : votingPools
  }, [data?.veBalGetVotingList])

  const gaugeAddresses = useMemo(() => votingList.map(vote => vote.gauge.address), [votingList])
  const { expiredGauges, isLoading: isExpiredGaugesLoading } = useExpiredGauges({ gaugeAddresses })
  const { incentives, incentivesError, incentivesAreLoading } = useVoteMarketIncentives()

  const {
    gaugeVotes,
    isLoading: gaugeVotesIsLoading,
    refetchAll,
  } = useGaugeVotes({ gaugeAddresses })

  const votingPools = useMemo<VotingPoolWithData[]>(() => {
    return votingList.map(vote => ({
      ...vote,
      gaugeVotes: gaugeVotes ? gaugeVotes[vote.gauge.address] : undefined,
      votingIncentive: incentives?.find(
        incentive => incentive.gauge === vote.gauge.address.toLowerCase()
      ),
    }))
  }, [votingList, gaugeVotes, incentives])

  const votedPools = useMemo(
    () => votingPools.filter(vote => bn(vote.gaugeVotes?.userVotes || '0').gt(0)),
    [votingPools]
  )

  const [votingPoolsByUser, setVotingPoolsByUser] = useState<Record<string, VotingPoolWithData[]>>(
    {}
  )

  const selectedVotingPools = useMemo(() => {
    if (!userAddress) return []

    const pools = votingPoolsByUser[userAddress] ?? []

    if (!gaugeVotes) return pools

    return pools.filter(pool => {
      const votesData = gaugeVotes[pool.gauge.address]

      if (!votesData) return true

      return bn(votesData.userVotes).lte(0)
    })
  }, [userAddress, gaugeVotes, votingPoolsByUser])

  const toggleVotingPool = (votingPool: VotingPoolWithData) => {
    if (!userAddress) return

    setVotingPoolsByUser(current => {
      const userPools = current[userAddress] ?? []
      const exists = userPools.find(pool => pool.id === votingPool.id)

      const updated = exists
        ? userPools.filter(pool => pool.id !== votingPool.id)
        : [...userPools, votingPool]

      return { ...current, [userAddress]: updated }
    })
  }

  const clearSelectedVotingPools = () => {
    if (!userAddress) return

    setVotingPoolsByUser(current => ({ ...current, [userAddress]: [] }))
  }

  const isSelectedPool = useCallback(
    (votingPool: VotingPoolWithData) =>
      Boolean(
        selectedVotingPools.find(selectedVotingPool => selectedVotingPool.id === votingPool.id)
      ),
    [selectedVotingPools]
  )

  const isVotedPool = useCallback(
    (vote: VotingPoolWithData) => Boolean(votedPools.find(votedPool => votedPool.id === vote.id)),
    [votedPools]
  )

  const isPoolGaugeExpired = useCallback(
    (votingPool: VotingPoolWithData) => isGaugeExpired(expiredGauges, votingPool.gauge.address),
    [expiredGauges]
  )

  const currentVotes = sumBy(votedPools, vote => bn(vote.gaugeVotes?.userVotes || 0).toNumber())

  const hasTimeLockedPools = votedPools.some(votedPool =>
    isVotingTimeLocked(votedPool.gaugeVotes?.lastUserVoteTime ?? 0)
  )

  const hasAllVotingPowerTimeLocked =
    votedPools.every(votedPool =>
      isVotingTimeLocked(votedPool.gaugeVotes?.lastUserVoteTime ?? 0)
    ) && sharesToBps(100).eq(currentVotes)

  const { mainnetLockedInfo } = useVebalLockInfo()
  const vebalIsExpired = mainnetLockedInfo.isExpired
  const vebalLockTooShort = mainnetLockedInfo.lockTooShort

  const { noVeBALBalance } = useVebalUserData()

  const votingIsDisabled =
    vebalIsExpired || vebalLockTooShort || noVeBALBalance || hasAllVotingPowerTimeLocked

  const allowChangeVotes = !votingIsDisabled
  const allowSelectVotingPools = !votingIsDisabled

  const scrollToMyVotes = () => {
    document.body.scrollIntoView({ behavior: 'smooth' })
  }

  return {
    votingPools,
    votingListLoading,
    incentives,
    incentivesError,
    incentivesAreLoading,
    loading:
      votingListLoading || incentivesAreLoading || gaugeVotesIsLoading || isExpiredGaugesLoading,
    isExpiredGaugesLoading,
    count: votingPools.length,
    error,
    gaugeVotesIsLoading,
    gaugeVotes,
    votedPools,
    selectedVotingPools,
    clearSelectedVotingPools,
    toggleVotingPool,
    isSelectedPool,
    isVotedPool,
    isPoolGaugeExpired,
    refetchAll,
    hasTimeLockedPools,
    hasAllVotingPowerTimeLocked,
    vebalIsExpired,
    vebalLockTooShort,
    allowSelectVotingPools,
    allowChangeVotes,
    expiredGauges,
    scrollToMyVotes,
  }
}

export const VotesContext = createContext<ReturnType<typeof useVotesLogic> | null>(null)

export function VotesProvider({ children, ...props }: PropsWithChildren<UseVotesArgs>) {
  const hook = useVotesLogic(props)

  return <VotesContext.Provider value={hook}>{children}</VotesContext.Provider>
}

export function useVotes() {
  return useMandatoryContext(VotesContext, 'Votes')
}
