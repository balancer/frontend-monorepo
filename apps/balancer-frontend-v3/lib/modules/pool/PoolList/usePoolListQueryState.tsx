'use client'

import {
  GqlChain,
  GqlPoolType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@/lib/shared/services/api/generated/graphql'
import { uniq } from 'lodash'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { useQueryState } from 'next-usequerystate'
import {
  POOL_CATEGORY_MAP,
  POOL_TYPE_MAP,
  PoolCategoryType,
  PoolFilterType,
  poolListQueryStateParsers,
  SortingState,
} from '../pool.types'
import { PaginationState } from '@/lib/shared/components/pagination/pagination.types'

export function usePoolListQueryState() {
  const [first, setFirst] = useQueryState('first', poolListQueryStateParsers.first)
  const [skip, setSkip] = useQueryState('skip', poolListQueryStateParsers.skip)
  const [orderBy, setOrderBy] = useQueryState('orderBy', poolListQueryStateParsers.orderBy)

  const [orderDirection, setOrderDirection] = useQueryState(
    'orderDirection',
    poolListQueryStateParsers.orderDirection
  )

  const [poolTypes, setPoolTypes] = useQueryState('poolTypes', poolListQueryStateParsers.poolTypes)
  const [networks, setNetworks] = useQueryState('networks', poolListQueryStateParsers.networks)

  const [textSearch, setTextSearch] = useQueryState(
    'textSearch',
    poolListQueryStateParsers.textSearch
  )

  const [userAddress, setUserAddress] = useQueryState(
    'userAddress',
    poolListQueryStateParsers.userAddress
  )

  const [minTvl, setMinTvl] = useQueryState('minTvl', poolListQueryStateParsers.minTvl)

  const [poolCategories, setPoolCategories] = useQueryState(
    'poolCategories',
    poolListQueryStateParsers.poolCategories
  )

  // Set internal checked state
  function toggleUserAddress(checked: boolean, address: string) {
    if (checked) {
      setUserAddress(address)
    } else {
      setUserAddress('')
    }
  }

  // Set internal checked state
  function togglePoolCategory(checked: boolean, poolCategory: PoolCategoryType) {
    if (checked) {
      setPoolCategories(current => uniq([...current, poolCategory]))
    } else {
      setPoolCategories(current => current.filter(item => item !== poolCategory))
    }
  }

  // Set internal checked state
  function toggleNetwork(checked: boolean, network: GqlChain) {
    if (checked) {
      setNetworks(current => uniq([...current, network]))
    } else {
      setNetworks(current => current.filter(chain => chain !== network))
    }
  }

  // Set internal checked state
  function togglePoolType(checked: boolean, poolType: PoolFilterType) {
    if (checked) {
      setPoolTypes(current => uniq([...current, poolType]))
    } else {
      setPoolTypes(current => current.filter(type => type !== poolType))
    }
  }

  function setSorting(sortingState: SortingState) {
    if (sortingState.length > 0) {
      setSkip(0)
      setOrderBy(sortingState[0].id)
      setOrderDirection(
        sortingState[0].desc ? GqlPoolOrderDirection.Desc : GqlPoolOrderDirection.Asc
      )
    } else {
      setOrderBy(GqlPoolOrderBy.TotalLiquidity)
      setOrderDirection(GqlPoolOrderDirection.Desc)
    }
  }

  function setPagination(pagination: PaginationState) {
    setFirst(pagination.pageSize)
    setSkip(pagination.pageIndex * pagination.pageSize)
  }

  function setSearch(text: string) {
    if (text.length > 0) {
      setSkip(0)
    }
    setTextSearch(text)
  }

  function poolTypeLabel(poolType: GqlPoolType) {
    switch (poolType) {
      case GqlPoolType.Weighted:
        return 'Weighted'
      case GqlPoolType.Stable:
        return 'Stable'
      case GqlPoolType.LiquidityBootstrapping:
        return 'Liquidity Bootstrapping (LBP)'
      case GqlPoolType.Gyro:
        return 'Gyro CLP'
      case GqlPoolType.CowAmm:
        return 'CoW AMM'
      default:
        return poolType.toLowerCase()
    }
  }

  function poolCategoryLabel(poolCategory: PoolCategoryType) {
    switch (poolCategory) {
      case 'INCENTIVIZED':
        return 'Incentivized'
      case 'POINTS':
        return 'Points'
      case 'SUPERFEST':
        return 'Superfest'
      case 'ARBITRUM_GRANTS':
        return 'Arbitrum Grants'
      default:
        return (poolCategory as string).toLowerCase().replace('_', ' ')
    }
  }

  function resetFilters() {
    setNetworks(null)
    setPoolTypes(null)
    setMinTvl(null)
    setPoolCategories(null)
    setUserAddress(null)
    setFirst(null)
    setSkip(null)
    setOrderBy(null)
    setOrderDirection(null)
  }

  const totalFilterCount =
    networks.length +
    poolTypes.length +
    (userAddress ? 1 : 0) +
    (minTvl > 0 ? 1 : 0) +
    poolCategories.length

  const sorting: SortingState = orderBy
    ? [{ id: orderBy, desc: orderDirection === GqlPoolOrderDirection.Desc }]
    : []

  const pagination: PaginationState = {
    pageIndex: skip / first,
    pageSize: first,
  }

  const mappedPoolTypes = uniq(
    (poolTypes.length > 0 ? poolTypes : Object.keys(POOL_TYPE_MAP))
      .map(poolType => POOL_TYPE_MAP[poolType as keyof typeof POOL_TYPE_MAP])
      .flat()
  )

  const mappedPoolCategories = uniq(
    (poolCategories.length > 0 ? poolCategories : [])
      .map(poolCategory => POOL_CATEGORY_MAP[poolCategory as keyof typeof POOL_CATEGORY_MAP])
      .flat()
  )

  const queryVariables = {
    first,
    skip,
    orderBy,
    orderDirection,
    where: {
      poolTypeIn: mappedPoolTypes,
      chainIn: networks.length > 0 ? networks : getProjectConfig().supportedNetworks,
      userAddress,
      minTvl,
      tagIn: mappedPoolCategories.length > 0 ? mappedPoolCategories : null,
      tagNotIn: ['BLACK_LISTED'],
    },
    textSearch,
  }

  return {
    state: {
      first,
      skip,
      orderBy,
      orderDirection,
      poolTypes,
      networks,
      textSearch,
    },
    toggleUserAddress,
    toggleNetwork,
    togglePoolType,
    togglePoolCategory,
    poolTypeLabel,
    setSorting,
    setPagination,
    setSearch,
    setMinTvl,
    setPoolTypes,
    setPoolCategories,
    resetFilters,
    poolCategoryLabel,
    setNetworks,
    poolCategories,
    minTvl,
    searchText: textSearch,
    pagination,
    sorting,
    totalFilterCount,
    poolTypes,
    networks,
    mappedPoolTypes,
    queryVariables,
    userAddress,
  }
}
