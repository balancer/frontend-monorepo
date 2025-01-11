'use client'

import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useMyVotesFiltersState } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/useMyVotesFiltersState'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import {
  MyVotesTotalInfo,
  SortingBy,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.types'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { orderBy, sumBy, uniqBy } from 'lodash'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useSubmitVotesAllSteps } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/actions/submit/useSubmitVotesAllSteps'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { sharesToBps } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'

import {
  getExceededWeight,
  getUnallocatedWeight,
  isVotingTimeLocked,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'

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
  const { loading, votedPools, selectedVotingPools, clearSelectedVotingPools, refetchAll } =
    useVotes()
  const filtersState = useMyVotesFiltersState()

  const myVotes = useMemo(() => {
    return uniqBy([...votedPools, ...selectedVotingPools], vote => vote.id)
  }, [votedPools, selectedVotingPools])

  const sortedMyVotes = useMemo(() => {
    return sortMyVotesList(myVotes, filtersState.sortingBy, filtersState.sorting)
  }, [myVotes, filtersState.sorting, filtersState.sortingBy])

  const hasVotes = myVotes.length > 0

  const [editVotesWeights, setEditVotesWeights] = useState<Record<string, string>>(() => ({}))

  useEffect(() => {
    setEditVotesWeights(current => {
      const result: Record<string, string> = {}

      for (const vote of myVotes) {
        result[vote.id] = current[vote.id] ? current[vote.id] : vote.gaugeVotes?.userVotes || '0'
      }

      return result
    })
  }, [myVotes])

  const onEditVotesChange = (id: string, value: string) => {
    setEditVotesWeights(current => ({
      ...current,
      [id]: value,
    }))
  }

  const totalInfo: MyVotesTotalInfo = useMemo(() => {
    const editVotes = sumBy(Object.values(editVotesWeights), weight => bn(weight).toNumber())
    const unallocatedVotes = sharesToBps(1).minus(editVotes).toNumber()
    return {
      currentVotes: sumBy(myVotes, vote => bn(vote.gaugeVotes?.userVotes || 0).toNumber()),
      editVotes,
      totalValue: sumBy(myVotes, vote => bn(vote.votingIncentive?.totalValue || 0).toNumber()),
      valuePerVote: sumBy(myVotes, vote => bn(vote.votingIncentive?.valuePerVote || 0).toNumber()),
      unallocatedVotes: Math.max(unallocatedVotes, 0),
    }
  }, [myVotes, editVotesWeights])

  const hasChanges =
    selectedVotingPools.length > 0 ||
    votedPools.some(
      votedPool => !bn(votedPool.gaugeVotes?.userVotes ?? 0).eq(editVotesWeights[votedPool.id])
    )

  const hasExceededWeight = getExceededWeight(totalInfo.editVotes ?? 0) > 0
  const hasUnallocatedWeight = getUnallocatedWeight(totalInfo.editVotes ?? 0) > 0

  const clearAll = () => {
    setEditVotesWeights({})
    clearSelectedVotingPools()
  }

  const submittingVotes = useMemo<SubmittingVote[]>(() => {
    return myVotes.flatMap(vote => {
      const state = editVotesWeights[vote.id]

      if (!state) return []

      return [
        {
          vote,
          weight: state,
        },
      ]
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
    loading,
    filtersState,
    hasVotes,
    hasChanges,
    totalInfo,
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
