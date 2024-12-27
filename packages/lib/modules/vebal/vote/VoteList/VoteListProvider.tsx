'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GetVeBalVotingListQuery, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useGaugeVotes } from '@repo/lib/modules/vebal/vote/gauge/useGaugeVotes'
import { SortingBy, VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderBy } from 'lodash'
import { HiddenHandData } from '@repo/lib/modules/vebal/vote/hidden-hand/hidden-hand.types'
import { useVoteListFiltersState } from '@repo/lib/modules/vebal/vote/VoteList/useVoteListFiltersState'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { PoolFilterType } from '@repo/lib/modules/pool/pool.types'

function sortVoteList(voteList: VotingPoolWithData[], sortBy: SortingBy, order: Sorting) {
  return orderBy(
    voteList,
    value => {
      switch (sortBy) {
        case SortingBy.votes:
          return value.gaugeVotes ? Number(value.gaugeVotes.votesNextPeriod) : -1
        case SortingBy.bribes:
          return value.votingIncentive ? Number(value.votingIncentive.totalValue) : -1
        case SortingBy.bribesPerVebal:
          return value.votingIncentive ? Number(value.votingIncentive.valuePerVote) : -1
        case SortingBy.type:
          return value.type
        default:
          throw new Error(`Unsupported SortingBy value (${sortBy})`)
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
  includeExpiredPools: boolean,
  protocolVersion: number | null
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
    result = result.filter(value => !value.gaugeVotes?.isKilled)
  }

  if (protocolVersion !== null) {
    console.warn('todo: implement protocolVersion filtering when api is ready')
  }

  return result
}

export interface UseVoteListArgs {
  data: GetVeBalVotingListQuery | undefined
  voteListLoading?: boolean
  error?: any
  votingIncentives?: HiddenHandData[]
  votingIncentivesLoading?: boolean
  votingIncentivesError?: any
}

export function _useVoteList({
  data,
  voteListLoading = false,
  error,
  votingIncentives,
  votingIncentivesError,
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
      filtersState.includeExpiredPools,
      filtersState.protocolVersion
    )
  }, [
    votingPoolsList,
    filtersState.searchText,
    filtersState.networks,
    filtersState.poolTypes,
    filtersState.includeExpiredPools,
    filtersState.protocolVersion,
  ])

  const sortedVoteList = useMemo(() => {
    const sortedList = sortVoteList(filteredVoteList, filtersState.sortingBy, filtersState.sorting)

    return sortedList.slice(
      filtersState.pagination.pageIndex * filtersState.pagination.pageSize,
      filtersState.pagination.pageSize * (filtersState.pagination.pageIndex + 1)
    )
  }, [filteredVoteList, filtersState.pagination, filtersState.sorting, filtersState.sortingBy])

  return {
    filtersState,
    sortedVoteList,
    voteListLoading,
    loading: voteListLoading || votingIncentivesLoading || gaugeVotesIsLoading,
    count: filteredVoteList.length,
    error,
    votingIncentivesLoading,
    votingIncentivesError,
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
