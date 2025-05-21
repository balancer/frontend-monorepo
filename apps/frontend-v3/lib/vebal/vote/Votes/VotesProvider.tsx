'use client'

import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isVotingTimeLocked, sharesToBps } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { compact, sumBy } from 'lodash'
import { useVebalLockInfo } from '@bal/lib/vebal/useVebalLockInfo'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { useExpiredGauges } from '@bal/lib/vebal/vote/useExpiredGaugesQuery'
import { useVotingEscrowLocksQueries } from '@bal/lib/vebal/cross-chain/useVotingEscrowLocksQueries'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { useHiddenHandVotingIncentives } from '@repo/lib/shared/services/hidden-hand/useHiddenHandVotingIncentives'
import { isGaugeExpired } from '@repo/lib/modules/vebal/vote/vote.helpers'
import { filterVotingPoolsForAnvilFork } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export interface UseVotesArgs {
  data: GetVeBalVotingListQuery | undefined
  votingListLoading?: boolean
  error?: any
}

export function useVotesLogic({ data, votingListLoading = false, error }: UseVotesArgs) {
  const { userAddress, isConnected } = useUserAccount()

  const votingList = useMemo(() => {
    const votingPools = data?.veBalGetVotingList || []
    return shouldUseAnvilFork ? filterVotingPoolsForAnvilFork(votingPools) : votingPools
  }, [data?.veBalGetVotingList])

  const gaugeAddresses = useMemo(() => votingList.map(vote => vote.gauge.address), [votingList])

  const {
    gaugeVotes,
    isLoading: gaugeVotesIsLoading,
    refetchAll,
  } = useGaugeVotes({ gaugeAddresses })

  const { expiredGauges, isLoading: isExpiredGaugesLoading } = useExpiredGauges({ gaugeAddresses })

  const { incentives, incentivesError, incentivesAreLoading } = useHiddenHandVotingIncentives()

  const votingPools = useMemo<VotingPoolWithData[]>(() => {
    return votingList.map(vote => ({
      ...vote,
      gaugeVotes: gaugeVotes ? gaugeVotes[vote.gauge.address] : undefined,
      votingIncentive: incentives
        ? incentives.find(incentive => incentive.poolId === vote.id)
        : undefined,
    }))
  }, [votingList, gaugeVotes, incentives])

  const votedPools = useMemo(
    () => votingPools.filter(vote => bn(vote.gaugeVotes?.userVotes || '0') > bn(0)),
    [votingPools]
  )

  const [selectedVotingPools, setSelectedVotingPools] = useState<VotingPoolWithData[]>([])

  useEffect(() => {
    setSelectedVotingPools([])
  }, [userAddress])

  useEffect(() => {
    if (gaugeVotes) {
      setSelectedVotingPools(selectedVotingPools =>
        // remove already voted selectedVotingPools (e.g. after refetch)
        selectedVotingPools.filter(selectedVotingPool => {
          const votesData = gaugeVotes[selectedVotingPool.gauge.address]

          if (!votesData) return true

          return !bn(votesData.userVotes).gt(0)
        })
      )
    }
  }, [gaugeVotes])

  const clearSelectedVotingPools = () => {
    setSelectedVotingPools([])
  }

  const toggleVotingPool = (votingPool: VotingPoolWithData) => {
    setSelectedVotingPools(current => {
      const foundVotingPool = current.find(
        selectedVotingPool => selectedVotingPool.id === votingPool.id
      )
      if (foundVotingPool) {
        return current.filter(selectedVotingPool => selectedVotingPool.id !== foundVotingPool.id)
      }
      return current.concat(votingPool)
    })
  }

  const isSelectedPool = useCallback(
    (votingPool: VotingPoolWithData) => {
      return Boolean(
        selectedVotingPools.find(selectedVotingPool => selectedVotingPool.id === votingPool.id)
      )
    },
    [selectedVotingPools]
  )

  const isVotedPool = useCallback(
    (vote: VotingPoolWithData) => {
      return Boolean(votedPools.find(votedPool => votedPool.id === vote.id))
    },
    [votedPools]
  )

  const isPoolGaugeExpired = useCallback(
    (votingPool: VotingPoolWithData) => {
      return isGaugeExpired(expiredGauges, votingPool.gauge.address)
    },
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

  const { veBALBalance, noVeBALBalance } = useVebalUserData()

  const votingIsDisabled =
    vebalIsExpired || vebalLockTooShort || noVeBALBalance || hasAllVotingPowerTimeLocked

  const allowChangeVotes = !votingIsDisabled
  const allowSelectVotingPools = !votingIsDisabled

  const votingEscrowResponses = useVotingEscrowLocksQueries(isConnected ? [userAddress] : [])

  // Timestamp when user has last received veBAL
  const lastReceivedVebal = useMemo(() => {
    const votingEscrowLocks = compact(
      votingEscrowResponses.flatMap(response => response.data?.votingEscrowLocks)
    )
    return (
      votingEscrowLocks.find(item =>
        isSameAddress(item.votingEscrowID.id, mainnetNetworkConfig.contracts.veBAL!)
      )?.updatedAt || 0
    )
  }, [votingEscrowResponses])

  //  If user has received more veBAL since they last voted, their voting power is under-utilized
  const poolsUsingUnderUtilizedVotingPower = useMemo<VotingPoolWithData[]>(
    () =>
      votingPools.filter(votingPool => {
        return (
          // Does the gauge have user votes
          bn(votingPool.gaugeVotes?.userVotes ?? 0).gt(0) &&
          // Has user received veBAL since they last voted
          votingPool.gaugeVotes?.lastUserVoteTime &&
          votingPool.gaugeVotes.lastUserVoteTime < lastReceivedVebal &&
          // Is voting currently not locked
          !isVotingTimeLocked(votingPool.gaugeVotes?.lastUserVoteTime ?? 0) &&
          // Is gauge not expired
          !isPoolGaugeExpired(votingPool)
        )
      }),
    [votingPools, lastReceivedVebal, isPoolGaugeExpired]
  )

  const shouldResubmitVotes = bn(veBALBalance).gt(0) && !!poolsUsingUnderUtilizedVotingPower.length // Does user have any veBAL

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
    shouldResubmitVotes,
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
