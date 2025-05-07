'use client'

import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useMyVotesFiltersState } from '@bal/lib/vebal/vote/Votes/MyVotes/useMyVotesFiltersState'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { MyVotesTotalInfo, SortingBy } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.types'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { orderBy, uniqBy } from 'lodash'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { bn, sum } from '@repo/lib/shared/utils/numbers'
import { useSubmitVotesAllSteps } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmitVotesAllSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import {
  bpsToPercentage,
  calculateMyValuePerVote,
  calculateMyVoteRewardsValue,
  sharesToBps,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'

import {
  getExceededWeight,
  getUnallocatedWeight,
  isVotingTimeLocked,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import BigNumber from 'bignumber.js'
import { useTotalVotes } from '../../useTotalVotes'
import { useVebalLockInfo } from '@bal/lib/vebal/useVebalLockInfo'
import { useBlacklistedVotes } from './incentivesBlacklist'
import { useLastUserSlope } from '../../useVeBALBalance'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

function sortMyVotesList(voteList: VotingPoolWithData[], sortBy: SortingBy, order: Sorting) {
  return orderBy(
    voteList,
    value => {
      switch (sortBy) {
        case SortingBy.currentVotes:
          return value.gaugeVotes ? Number(value.gaugeVotes.userVotes) : -1
        case SortingBy.bribes:
          return value.votingIncentive ? Number(value.votingIncentive.totalValue) : -1
        case SortingBy.bribesPerVebal:
          return value.votingIncentive ? Number(value.votingIncentive.valuePerVote) : -1
        case SortingBy.editVotes:
          return 0
        default:
          throw new Error(`Unsupported SortingBy value (${sortBy})`)
      }
    },
    order === Sorting.asc ? 'asc' : 'desc'
  )
}

export interface SubmittingVote {
  vote: VotingPoolWithData
  weight: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseMyVotesArgs {}

// eslint-disable-next-line no-empty-pattern
export function _useMyVotes({}: UseMyVotesArgs) {
  const {
    loading: votesLoading,
    votingPools,
    votedPools,
    selectedVotingPools,
    clearSelectedVotingPools,
    refetchAll,
    isPoolGaugeExpired,
  } = useVotes()
  const filtersState = useMyVotesFiltersState()

  const myVotes = useMemo(() => {
    return uniqBy([...votedPools, ...selectedVotingPools], vote => vote.id)
  }, [votedPools, selectedVotingPools])

  const sortedMyVotes = useMemo(() => {
    return sortMyVotesList(myVotes, filtersState.sortingBy, filtersState.sorting)
  }, [myVotes, filtersState.sorting, filtersState.sortingBy])

  const hasVotes = myVotes.length > 0

  const votedVotesWeights = useMemo<Record<string, string>>(
    () => Object.fromEntries(votedPools.map(vote => [vote.id, vote.gaugeVotes?.userVotes || '0'])),
    [votedPools]
  )

  // Record<VoteId, Weight>
  const [editVotesWeights, setEditVotesWeights] = useState<Record<string, string>>(() => ({}))

  useEffect(() => {
    setEditVotesWeights(current => {
      const result: Record<string, string> = {}

      for (const vote of myVotes) {
        if (isPoolGaugeExpired(vote)) {
          result[vote.id] = '0'
        } else {
          result[vote.id] = current[vote.id] ? current[vote.id] : vote.gaugeVotes?.userVotes || '0'
        }
      }

      return result
    })
  }, [myVotes, isPoolGaugeExpired])

  const onEditVotesChange = (id: string, value: string) => {
    setEditVotesWeights(current => ({
      ...current,
      [id]: value,
    }))
  }

  const hasExpiredGauges = myVotes.some(votedPool => votedPool.gauge.isKilled)

  const availableMyVotes = useMemo(() => {
    return myVotes.filter(myVote => !isPoolGaugeExpired(myVote))
  }, [myVotes, isPoolGaugeExpired])

  const { totalVotes, totalVotesLoading } = useTotalVotes()
  const { mainnetLockedInfo, isLoading: lockInfoLoading } = useVebalLockInfo()
  const lockEnd = mainnetLockedInfo.lockedEndDate
  const { blacklistedVotes, isLoading: blacklistedLoading } = useBlacklistedVotes(votingPools)
  const { userAddress, isLoading: userAccountLoading } = useUserAccount()
  const { slope, isLoading: slopeLoading } = useLastUserSlope(userAddress)

  const totalInfo: MyVotesTotalInfo = useMemo(() => {
    const infos = availableMyVotes.map(myVote => {
      const currentWeight = myVote.gaugeVotes?.userVotes || 0
      const votedWeight = votedVotesWeights[myVote.id] || 0
      const editWeight = editVotesWeights[myVote.id] || 0
      const totalValue = myVote.votingIncentive?.totalValue || 0
      const valuePerVote = calculateMyValuePerVote(
        editWeight,
        myVote,
        slope,
        lockEnd,
        totalVotes,
        blacklistedVotes[myVote.gauge.address]
      )

      return {
        currentWeight,
        votedWeight,
        editWeight,
        totalValue,
        valuePerVote,
        vote: myVote,
      }
    })

    const currentVotes = sum(infos, ({ currentWeight }) => bn(currentWeight))
    const editVotes = sum(infos, ({ editWeight }) => bn(editWeight))

    const totalRewardValue = sum(infos, ({ editWeight, vote }) =>
      calculateMyVoteRewardsValue(
        editWeight,
        vote,
        slope,
        lockEnd,
        totalVotes,
        blacklistedVotes[vote.gauge.address]
      )
    )

    const prevTotalRewardValue = sum(infos, ({ votedWeight, vote }) =>
      calculateMyVoteRewardsValue(
        votedWeight,
        vote,
        slope,
        lockEnd,
        totalVotes,
        blacklistedVotes[vote.gauge.address]
      )
    )

    const averageRewardPerVote = sum(infos, ({ valuePerVote, editWeight }) =>
      bn(valuePerVote).multipliedBy(bpsToPercentage(editWeight))
    )
    const prevAverageRewardPerVote = sum(infos, ({ valuePerVote, votedWeight }) =>
      bn(valuePerVote).multipliedBy(bpsToPercentage(votedWeight))
    )

    const unallocatedVotes = sharesToBps(100).minus(editVotes)

    return {
      currentVotes,
      editVotes,
      totalRewardValue,
      prevTotalRewardValue,
      totalRewardValueGain: totalRewardValue.minus(prevTotalRewardValue),
      averageRewardPerVote,
      averageRewardPerVoteGain: averageRewardPerVote.minus(prevAverageRewardPerVote),
      unallocatedVotes: BigNumber.max(unallocatedVotes, 0),
    }
  }, [
    availableMyVotes,
    votedVotesWeights,
    editVotesWeights,
    totalVotes,
    slope,
    blacklistedVotes,
    lockEnd,
  ])

  const hasVotedBefore = votedPools.length > 0

  const hasChanges =
    (selectedVotingPools.length > 0 &&
      selectedVotingPools.some(votingPool => bn(editVotesWeights[votingPool.id] ?? 0).gt(0))) ||
    votedPools.some(
      votedPool => !bn(votedPool.gaugeVotes?.userVotes ?? 0).eq(editVotesWeights[votedPool.id])
    )

  const hasExceededWeight = getExceededWeight(totalInfo.editVotes || bn(0)).gt(0)
  const hasUnallocatedWeight = getUnallocatedWeight(totalInfo.editVotes || bn(0)).gt(0)

  const clearAll = () => {
    setEditVotesWeights({})
    clearSelectedVotingPools()
  }

  const submittingVotes = useMemo<SubmittingVote[]>(() => {
    return myVotes
      .filter(vote => !isVotingTimeLocked(vote.gaugeVotes?.lastUserVoteTime ?? 0))
      .filter(vote => {
        const newVoteWeight = editVotesWeights[vote.id] || 0
        const persistedVoteWeight = vote.gaugeVotes?.userVotes || 0
        if (bn(newVoteWeight).isZero() && bn(persistedVoteWeight).isZero()) return false
        return newVoteWeight !== persistedVoteWeight
      })
      .map(vote => {
        const newVote = editVotesWeights[vote.id] || '0'
        return {
          vote,
          weight: newVote,
        }
      })
  }, [myVotes, editVotesWeights])

  const timeLockedVotes: SubmittingVote[] = useMemo<SubmittingVote[]>(() => {
    return votedPools
      .filter(vote => isVotingTimeLocked(vote.gaugeVotes?.lastUserVoteTime ?? 0))
      .map(vote => {
        return {
          vote,
          weight: vote.gaugeVotes?.userVotes ?? '0',
        }
      })
  }, [votedPools])

  const { steps, isLoadingSteps } = useSubmitVotesAllSteps({ votes: submittingVotes })

  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)
  const txHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  return {
    myVotes,
    sortedMyVotes,
    loading:
      votesLoading ||
      totalVotesLoading ||
      blacklistedLoading ||
      lockInfoLoading ||
      slopeLoading ||
      userAccountLoading,
    filtersState,
    hasVotes,
    hasVotedBefore,
    hasChanges,
    totalInfo,
    votedVotesWeights,
    editVotesWeights,
    onEditVotesChange,
    clearAll,
    transactionSteps,
    txHash,
    submittingVotes,
    timeLockedVotes,
    hasExceededWeight,
    hasUnallocatedWeight,
    refetchAll,
    hasExpiredGauges,
  }
}

export const MyVotesContext = createContext<ReturnType<typeof _useMyVotes> | null>(null)

export function MyVotesProvider({ children, ...props }: PropsWithChildren<UseMyVotesArgs>) {
  const hook = _useMyVotes(props)

  return <MyVotesContext.Provider value={hook}>{children}</MyVotesContext.Provider>
}

export function useMyVotes() {
  return useMandatoryContext(MyVotesContext, 'MyVotes')
}
