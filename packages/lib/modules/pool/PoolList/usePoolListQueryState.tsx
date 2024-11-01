'use client'

import {
  GqlChain,
  GqlPoolType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@repo/lib/shared/services/api/generated/graphql'
import { uniq } from 'lodash'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { useQueryState } from 'nuqs'
import {
  POOL_TAG_MAP,
  POOL_TYPE_MAP,
  PoolFilterType,
  poolListQueryStateParsers,
  PoolTagType,
  SortingState,
} from '../pool.types'
import { PaginationState } from '@repo/lib/shared/components/pagination/pagination.types'
import { useState } from 'react'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'

export const PROTOCOL_VERSION_TABS: ButtonGroupOption[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'v2',
    label: 'v2',
  },
  {
    value: 'v3',
    label: 'v3',
  },
  {
    value: 'cow',
    label: 'CoW',
  },
] as const

export function usePoolListQueryState() {
  const [first, setFirst] = useQueryState('first', poolListQueryStateParsers.first)
  const [skip, setSkip] = useQueryState('skip', poolListQueryStateParsers.skip)
  const [orderBy, setOrderBy] = useQueryState('orderBy', poolListQueryStateParsers.orderBy)

  const [activeProtocolVersionTab, setActiveProtocolVersionTab] = useState(PROTOCOL_VERSION_TABS[0])

  const [orderDirection, setOrderDirection] = useQueryState(
    'orderDirection',
    poolListQueryStateParsers.orderDirection
  )

  const [poolTypes, setPoolTypes] = useQueryState('poolTypes', poolListQueryStateParsers.poolTypes)
  const [protocolVersion, setProtocolVersion] = useQueryState(
    'protocolVersion',
    poolListQueryStateParsers.protocolVersion
  )
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

  const [poolTags, setPoolTags] = useQueryState('poolTags', poolListQueryStateParsers.poolTags)

  // Set internal checked state
  function toggleUserAddress(checked: boolean, address: string) {
    if (checked) {
      setUserAddress(address)
    } else {
      setUserAddress('')
    }
  }

  // Set internal checked state
  function togglePoolTag(checked: boolean, poolTag: PoolTagType) {
    if (checked) {
      setPoolTags(current => uniq([...current, poolTag]))
    } else {
      setPoolTags(current => current.filter(item => item !== poolTag))
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
      case GqlPoolType.Fx:
        return 'FX'
      default:
        return poolType.toLowerCase()
    }
  }

  function poolTagLabel(poolTag: PoolTagType) {
    switch (poolTag) {
      case 'INCENTIVIZED':
        return 'Incentivized'
      case 'POINTS':
        return 'Points'
      default:
        return (poolTag as string).toLowerCase().replace('_', ' ')
    }
  }

  function resetFilters() {
    setNetworks(null)
    setPoolTypes(null)
    setMinTvl(null)
    setPoolTags(null)
    setUserAddress(null)
    setFirst(null)
    setSkip(null)
    setOrderBy(null)
    setOrderDirection(null)
    setProtocolVersion(null)
  }

  const totalFilterCount =
    networks.length +
    poolTypes.length +
    (userAddress ? 1 : 0) +
    (minTvl > 0 ? 1 : 0) +
    poolTags.length +
    (protocolVersion ? 1 : 0)

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

  const mappedPoolTags = uniq(
    (poolTags.length > 0 ? poolTags : [])
      .map(poolTag => POOL_TAG_MAP[poolTag as keyof typeof POOL_TAG_MAP])
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
      tagIn: mappedPoolTags.length > 0 ? mappedPoolTags : null,
      tagNotIn: ['BLACK_LISTED'],
      protocolVersionIn: protocolVersion ? [protocolVersion] : undefined,
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
      protocolVersion,
    },
    toggleUserAddress,
    toggleNetwork,
    togglePoolType,
    togglePoolTag,
    poolTypeLabel,
    setSorting,
    setPagination,
    setSearch,
    setMinTvl,
    setPoolTypes,
    setPoolTags,
    resetFilters,
    poolTagLabel,
    setNetworks,
    setProtocolVersion,
    setActiveProtocolVersionTab,
    activeProtocolVersionTab,
    poolTags,
    protocolVersion,
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
