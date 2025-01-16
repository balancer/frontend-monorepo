'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GetVeBalVotingListQuery, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/useGaugeVotes'
import { SortVotesBy, VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderBy } from 'lodash'
import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'
import { useVoteListFiltersState } from '@repo/lib/modules/vebal/vote/VoteList/useVoteListFiltersState'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { PoolFilterType } from '@repo/lib/modules/pool/pool.types'

function sortVoteList(voteList: VotingPoolWithData[], sortBy: SortVotesBy, order: Sorting) {
  return orderBy(
    voteList,
    value => {
      switch (sortBy) {
        case SortVotesBy.votes:
          return value.gaugeVotes ? Number(value.gaugeVotes.votesNextPeriod) : -1
        case SortVotesBy.bribes:
          return value.votingIncentive ? Number(value.votingIncentive.totalValue) : -1
        case SortVotesBy.bribesPerVebal:
          return value.votingIncentive ? Number(value.votingIncentive.valuePerVote) : -1
        case SortVotesBy.type:
          return value.type
        default:
          throw new Error(`Unsupported SortVotesBy value (${sortBy})`)
      }
    },
    order === Sorting.asc ? 'asc' : 'desc'
  )
}

function filterVoteList(
  voteList: VotingPoolWithData[],
  textSearch: string,
  networks: GqlChain[],
  poolTypes: PoolFilterType[],
  includeExpiredPools: boolean
) {
  let result = voteList

  const _textSearch = textSearch.toLowerCase().trim()
  if (_textSearch) {
    result = result.filter(value => {
      return (
        value.id.toLowerCase().includes(_textSearch) ||
        value.tokens.some(token => {
          return (
            token.symbol.toLowerCase().includes(_textSearch) ||
            token.address.toLowerCase().includes(_textSearch)
          )
        })
      )
    })
  }

  if (networks.length > 0) {
    result = result.filter(value => networks.includes(value.chain))
  }

  if (poolTypes.length > 0) {
    result = result.filter(value => poolTypes.includes(value.type as PoolFilterType))
  }

  if (!includeExpiredPools) {
    // fix: fixed in feat/my-votes
    result = result.filter(value => !value.gaugeVotes?.isKilled)
  }

  return result
}

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
  const filtersState = useVoteListFiltersState()

  const voteListData = useMemo(() => data?.veBalGetVotingList || [], [data?.veBalGetVotingList])

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

  const filteredVoteList = useMemo(() => {
    return filterVoteList(
      votingPoolsList,
      filtersState.searchText,
      filtersState.networks,
      filtersState.poolTypes,
      filtersState.includeExpiredPools
    )
  }, [
    votingPoolsList,
    filtersState.searchText,
    filtersState.networks,
    filtersState.poolTypes,
    filtersState.includeExpiredPools,
  ])

  const sortedVoteList = useMemo(() => {
    const sortedList = sortVoteList(
      filteredVoteList,
      filtersState.sortVotesBy,
      filtersState.sorting
    )

    return sortedList.slice(
      filtersState.pagination.pageIndex * filtersState.pagination.pageSize,
      filtersState.pagination.pageSize * (filtersState.pagination.pageIndex + 1)
    )
  }, [filteredVoteList, filtersState.pagination, filtersState.sorting, filtersState.sortVotesBy])

  return {
    filtersState,
    sortedVoteList,
    voteListLoading,
    loading: voteListLoading || votingIncentivesLoading || gaugeVotesIsLoading,
    count: filteredVoteList.length,
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
