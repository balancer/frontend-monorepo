'use client'

import { createContext, PropsWithChildren, useMemo } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { SortVotesBy, VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderBy } from 'lodash'
import { useVoteListFiltersState } from '@bal/lib/vebal/vote/VoteList/useVoteListFiltersState'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { PoolFilterType } from '@repo/lib/modules/pool/pool.types'
import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'

function sortVoteList(voteList: VotingPoolWithData[], sortBy: SortVotesBy, order: Sorting) {
  return orderBy(
    voteList,
    [
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
      value => (value.gaugeVotes ? Number(value.gaugeVotes.votesNextPeriod) : -1),
    ],
    [order === Sorting.asc ? 'asc' : 'desc', 'desc']
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
        value.poolTokens.some(token => {
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
    result = result.filter(pool => !pool.gauge.isKilled)
  }

  if (protocolVersion) {
    result = result.filter(pool => pool.protocolVersion === protocolVersion)
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseVoteListArgs {}

// eslint-disable-next-line no-empty-pattern
export function useVoteListLogic({}: UseVoteListArgs) {
  const {
    votingPools,
    incentives,
    incentivesError,
    incentivesAreLoading,
    votingListLoading,
    gaugeVotesIsLoading,
    isExpiredGaugesLoading,
    gaugeVotes,
  } = useVotes()

  const filtersState = useVoteListFiltersState()

  const voteListData = votingPools

  const votingPoolsList = useMemo<VotingPoolWithData[]>(() => {
    return voteListData.map(vote => ({
      ...vote,
      gaugeVotes: gaugeVotes ? gaugeVotes[vote.gauge.address] : undefined,
      votingIncentive: incentives
        ? incentives.find(incentive => incentive.poolId === vote.id)
        : undefined,
    }))
  }, [voteListData, gaugeVotes, incentives])

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
    votingListLoading,
    loading:
      votingListLoading || incentivesAreLoading || gaugeVotesIsLoading || isExpiredGaugesLoading,
    count: filteredVoteList.length,
    incentivesAreLoading,
    incentivesError,
    gaugeVotesIsLoading,
  }
}

export const VoteListContext = createContext<ReturnType<typeof useVoteListLogic> | null>(null)

export function VoteListProvider({ children, ...props }: PropsWithChildren<UseVoteListArgs>) {
  const hook = useVoteListLogic(props)

  return <VoteListContext.Provider value={hook}>{children}</VoteListContext.Provider>
}

export function useVoteList() {
  return useMandatoryContext(VoteListContext, 'VoteList')
}
