'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GetVeBalVotingListDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'

export function _useVoteList() {
  const queryState = usePoolListQueryState()

  const { data, loading, previousData, refetch, error } = useQuery(GetVeBalVotingListDocument)

  const voteList =
    loading && previousData ? previousData.veBalGetVotingList : data?.veBalGetVotingList || []

  const pagination = queryState.pagination

  const sortedVoteList = useMemo(() => {
    return voteList.slice(
      pagination.pageIndex * pagination.pageSize,
      pagination.pageSize * (pagination.pageIndex + 1)
    )
  }, [voteList, pagination])

  return {
    queryState,
    sortedVoteList,
    loading,
    count: data?.veBalGetVotingList.length || previousData?.veBalGetVotingList.length,
    refetch,
    error,
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
