'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import { useHiddenHandVotingIncentives } from '@repo/lib/modules/vebal/vote/hidden-hand/useHiddenHandVotingIncentives'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/gauge/useGaugeVotes'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderBy } from 'lodash'

export function _useVoteList() {
  // todo: implement vote's sorting/filtering
  const queryState = usePoolListQueryState()

  const {
    data,
    loading: voteListLoading,
    previousData,
    refetch,
    error,
  } = useQuery(GetVeBalVotingListDocument)

  const voteListData =
    voteListLoading && previousData
      ? previousData.veBalGetVotingList
      : data?.veBalGetVotingList || []

  const pagination = queryState.pagination

  const {
    data: votingIncentives,
    isLoading: votingIncentivesLoading,
    error: votingIncentivesError,
  } = useHiddenHandVotingIncentives()

  const gaugeAddresses = useMemo(() => voteListData.map(vote => vote.gauge.address), [voteListData])

  const { gaugeVotes, isLoading: gaugeVotesIsLoading } = useGaugeVotes({ gaugeAddresses })

  const votingPoolsList = useMemo<VotingPoolWithData[]>(() => {
    return voteListData.map(vote => ({
      ...vote,
      gaugeVotes: gaugeVotes ? gaugeVotes[vote.gauge.address] : undefined,
      votingIncentive: votingIncentives
        ? votingIncentives.find(votingIncentive => votingIncentive.poolId === vote.id)
        : undefined,
    }))
  }, [voteListData, gaugeVotes, votingIncentives])

  const sortedVoteList = useMemo(() => {
    const sortedList = orderBy(
      votingPoolsList,
      v => (v.gaugeVotes ? Number(v.gaugeVotes.votesNextPeriod) : 0),
      'desc'
    )

    return sortedList.slice(
      pagination.pageIndex * pagination.pageSize,
      pagination.pageSize * (pagination.pageIndex + 1)
    )
  }, [votingPoolsList, pagination])

  return {
    queryState,
    sortedVoteList,
    voteListLoading,
    loading: voteListLoading || votingIncentivesLoading || gaugeVotesIsLoading,
    count: data?.veBalGetVotingList.length || previousData?.veBalGetVotingList.length,
    refetch,
    error,
    votingIncentivesLoading,
    votingIncentivesError,
    gaugeVotesIsLoading,
  }
}

export const VoteListContext = createContext<ReturnType<typeof _useVoteList> | null>(null)

export function VoteListProvider({ children }: PropsWithChildren) {
  const hook = _useVoteList()

  return <VoteListContext.Provider value={hook}>{children}</VoteListContext.Provider>
}

export function useVoteList() {
  return useMandatoryContext(VoteListContext, 'VoteList')
}
