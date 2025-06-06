import { useMemo, useState } from 'react'
import { PaginationState } from '@repo/lib/shared/components/pagination/pagination.types'
import { SortVotesBy } from '@repo/lib/modules/vebal/vote/vote.types'
import { Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { uniq } from 'lodash'
import { PoolFilterType } from '@repo/lib/modules/pool/pool.types'
import { PROTOCOL_VERSION_TABS } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'

const EMPTY_ARRAY: never[] = []

export function useVoteListFiltersState() {
  const [sorting, setSorting] = useState<Sorting>(Sorting.desc)
  const [sortVotesBy, setSortVotesBy] = useState<SortVotesBy>(SortVotesBy.bribesPerVebal)

  const [first, setFirst] = useState(20)
  const [skip, setSkip] = useState(0)

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: skip / first,
      pageSize: first,
    }),
    [skip, first]
  )

  function setPagination(pagination: PaginationState) {
    setFirst(pagination.pageSize)
    setSkip(pagination.pageIndex * pagination.pageSize)
  }

  function toggleSorting() {
    setSorting(sorting === Sorting.asc ? Sorting.desc : Sorting.asc)
  }

  const [networks, setNetworks] = useState<GqlChain[] | null>(null)
  const [poolTypes, setPoolTypes] = useState<PoolFilterType[] | null>(null)
  const [includeExpiredPools, setIncludeExpiredPools] = useState(false)

  const [activeProtocolVersionTab, setActiveProtocolVersionTab] = useState(PROTOCOL_VERSION_TABS[0])
  const [protocolVersion, setProtocolVersion] = useState<number | null>(null)

  const [textSearch, setTextSearch] = useState('')

  function resetFilters() {
    setNetworks(null)
    setPoolTypes(null)
    setIncludeExpiredPools(false)
    setProtocolVersion(null)

    setPagination({ pageSize: 20, pageIndex: 0 })
    setSorting(Sorting.desc)
    setSortVotesBy(SortVotesBy.votes)
  }

  // Set internal checked state
  function toggleNetwork(checked: boolean, network: GqlChain) {
    if (checked) {
      setNetworks(current => uniq([...(current ?? []), network]))
    } else {
      setNetworks(current => (current ?? []).filter(chain => chain !== network))
    }
  }

  // Set internal checked state
  function togglePoolType(checked: boolean, poolType: PoolFilterType) {
    if (checked) {
      setPoolTypes(current => uniq([...(current ?? []), poolType]))
    } else {
      setPoolTypes(current => (current ?? []).filter(type => type !== poolType))
    }
  }

  // Set internal checked state
  function toggleIncludeExpiredPools(checked: boolean) {
    setIncludeExpiredPools(checked)
  }

  const totalFilterCount =
    (networks?.length ?? 0) + (poolTypes?.length ?? 0) + (includeExpiredPools ? 1 : 0)

  function setSearch(text: string) {
    if (text.length > 0) {
      setSkip(0)
    }
    setTextSearch(text)
  }

  return {
    sorting,
    setSorting,
    sortVotesBy,
    setSortVotesBy,
    pagination,
    setPagination,
    toggleSorting,
    totalFilterCount,
    resetFilters,
    searchText: textSearch,
    setSearch,
    networks: networks ?? EMPTY_ARRAY,
    poolTypes: poolTypes ?? EMPTY_ARRAY,
    includeExpiredPools,
    protocolVersion,
    activeProtocolVersionTab,
    toggleNetwork,
    togglePoolType,
    toggleIncludeExpiredPools,
    setNetworks,
    setPoolTypes,
    setProtocolVersion,
    setActiveProtocolVersionTab,
  }
}
