'use client'

import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import {
  isVotingTimeLocked,
  sharesToBps,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { compact, sumBy } from 'lodash'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/useVebalLockInfo'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { useExpiredGauges } from '@repo/lib/modules/vebal/vote/useExpiredGaugesQuery'
import { isGaugeExpired } from '@repo/lib/modules/vebal/vote/vote.helpers'
import { useVotingEscrowLocksQueries } from '@repo/lib/modules/vebal/cross-chain/useVotingEscrowLocksQueries'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'

export interface UseVotesArgs {
  data: GetVeBalVotingListQuery | undefined
  votingListLoading?: boolean
  error?: any
  votingIncentives?: HiddenHandData[]
  votingIncentivesLoading?: boolean
  votingIncentivesErrorMessage?: string
}

export function _useVotes({
  data,
  votingListLoading = false,
  error,
  votingIncentives,
  votingIncentivesErrorMessage,
  votingIncentivesLoading = false,
}: UseVotesArgs) {
  const { userAddress, isConnected } = useUserAccount()

  const votingList = useMemo(() => data?.veBalGetVotingList || [], [data?.veBalGetVotingList])

  const gaugeAddresses = useMemo(() => votingList.map(vote => vote.gauge.address), [votingList])

  const {
    gaugeVotes,
    isLoading: gaugeVotesIsLoading,
    refetchAll,
  } = useGaugeVotes({ gaugeAddresses })

  const { expiredGauges } = useExpiredGauges({ gaugeAddresses })

  const votingPools = useMemo<VotingPoolWithData[]>(() => {
    return votingList.map(vote => ({
      ...vote,
      gaugeVotes: gaugeVotes ? gaugeVotes[vote.gauge.address] : undefined,
      votingIncentive: votingIncentives
        ? votingIncentives.find(votingIncentive => votingIncentive.poolId === vote.id)
        : undefined,
    }))
  }, [votingList, gaugeVotes, votingIncentives])

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
    ) && sharesToBps(1).eq(currentVotes)

  const { mainnetLockedInfo } = useVebalLockInfo()
  const vebalIsExpired = mainnetLockedInfo.isExpired
  const vebalLockTooShort = mainnetLockedInfo.lockTooShort

  const { myVebalBalance, noVeBalBalance } = useVebalUserData()

  const votingIsDisabled =
    vebalIsExpired || vebalLockTooShort || noVeBalBalance || hasAllVotingPowerTimeLocked
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  const shouldResubmitVotes = // Does user have any veBAL
    bn(myVebalBalance ?? 0).gt(0) && !!poolsUsingUnderUtilizedVotingPower.length

  const scrollToMyVotes = () => {
    document.body.scrollIntoView({ behavior: 'smooth' })
  }

  return {
    votingPools,
    votingListLoading,
    votingIncentives,
    loading: votingListLoading || votingIncentivesLoading || gaugeVotesIsLoading,
    count: votingPools.length,
    error,
    votingIncentivesLoading,
    votingIncentivesErrorMessage,
    gaugeVotesIsLoading,
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

export const VotesContext = createContext<ReturnType<typeof _useVotes> | null>(null)

export function VotesProvider({ children, ...props }: PropsWithChildren<UseVotesArgs>) {
  const hook = _useVotes(props)

  return <VotesContext.Provider value={hook}>{children}</VotesContext.Provider>
}

export function useVotes() {
  return useMandatoryContext(VotesContext, 'Votes')
}
