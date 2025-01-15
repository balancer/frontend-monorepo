'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GetVeBalVotingListQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderBy } from 'lodash'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'

export interface UseVoteListArgs {
  data: GetVeBalVotingListQuery | undefined
  voteListLoading?: boolean
  votingIncentives?: HiddenHandData[]
  votingIncentivesLoading?: boolean
  votingIncentivesErrorMessage?: string
}

export function _useVoteList({
  data,
  voteListLoading = false,
  votingIncentives,
  votingIncentivesErrorMessage,
  votingIncentivesLoading = false,
}: UseVoteListArgs) {
  // todo: implement vote's sorting/filtering
  const queryState = usePoolListQueryState()

  const voteListData = useMemo(() => data?.veBalGetVotingList || [], [data?.veBalGetVotingList])

  const pagination = queryState.pagination

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
    count: data?.veBalGetVotingList.length,
    votingIncentivesLoading,
    votingIncentivesErrorMessage, // todo: should be used in VoteListTable
    gaugeVotesIsLoading,
  }
}

export const VoteListContext = createContext<ReturnType<typeof _useVoteList> | null>(null)

export function VoteListProvider({ children, ...props }: PropsWithChildren<UseVoteListArgs>) {
  const hook = _useVoteList(props)

  return <VoteListContext.Provider value={hook}>{children}</VoteListContext.Provider>
}

export function useVoteList() {
  return useMandatoryContext(VoteListContext, 'VoteList')
}
