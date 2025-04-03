'use client'

import {
  GqlChain,
  GqlPoolType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@repo/lib/shared/services/api/generated/graphql'
import { uniq } from 'lodash'
import { useQueryState } from 'nuqs'
import {
  POOL_TYPE_MAP,
  PoolFilterType,
  PoolHookTagType,
  poolListQueryStateParsers,
  PoolTagType,
  SortingState,
} from '../pool.types'
import { PaginationState } from '@repo/lib/shared/components/pagination/pagination.types'
import { useEffect, useState } from 'react'
import { ButtonGroupOption } from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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

export function poolTypeLabel(poolType: GqlPoolType) {
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
    case GqlPoolType.QuantAmmWeighted:
      return 'BTF'
    default:
      return poolType.toLowerCase()
  }
}

export function usePoolListQueryState() {
  const [first, setFirst] = useQueryState('first', poolListQueryStateParsers.first)
  const [skip, setSkip] = useQueryState('skip', poolListQueryStateParsers.skip)
  const [orderBy, setOrderBy] = useQueryState('orderBy', poolListQueryStateParsers.orderBy)
  const [activeProtocolVersionTab, setActiveProtocolVersionTab] = useState(PROTOCOL_VERSION_TABS[0])
  const [poolTypes, setPoolTypes] = useQueryState('poolTypes', poolListQueryStateParsers.poolTypes)
  const [networks, setNetworks] = useQueryState('networks', poolListQueryStateParsers.networks)
  const [minTvl, setMinTvl] = useQueryState('minTvl', poolListQueryStateParsers.minTvl)
  const [poolTags, setPoolTags] = useQueryState('poolTags', poolListQueryStateParsers.poolTags)
  const [poolHookTags, setPoolHookTags] = useQueryState(
    'poolHookTags',
    poolListQueryStateParsers.poolHookTags
  )

  const [orderDirection, setOrderDirection] = useQueryState(
    'orderDirection',
    poolListQueryStateParsers.orderDirection
  )

  const [protocolVersion, setProtocolVersion] = useQueryState(
    'protocolVersion',
    poolListQueryStateParsers.protocolVersion
  )

  const [textSearch, setTextSearch] = useQueryState(
    'textSearch',
    poolListQueryStateParsers.textSearch
  )

  const [userAddress, setUserAddress] = useQueryState(
    'userAddress',
    poolListQueryStateParsers.userAddress
  )

  // on toggle always start at the beginning of the list
  useEffect(() => {
    if (skip) setSkip(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolTypes, networks, minTvl, poolTags])

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
  function togglePoolHookTag(checked: boolean, poolHookTag: PoolHookTagType) {
    if (checked) {
      setPoolHookTags(current => uniq([...current, poolHookTag]))
    } else {
      setPoolHookTags(current => current.filter(item => item !== poolHookTag))
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

  function poolTagLabel(poolTag: PoolTagType) {
    switch (poolTag) {
      case 'INCENTIVIZED':
        return 'Incentivized'
      case 'POINTS':
        return 'Points'
      case 'BOOSTED':
        return 'Boosted'
      case 'RWA':
        return 'RWA'
      default:
        return (poolTag as string).toLowerCase().replace('_', ' ')
    }
  }

  function poolHookTagLabel(poolHookTag: PoolHookTagType) {
    switch (poolHookTag) {
      case 'HOOKS_STABLESURGE':
        return 'StableSurge'
      case 'HOOKS_MEVCAPTURE':
        return 'MEV Capture'
      case 'HOOKS_EXITFEE':
        return 'ExitFee'
      case 'HOOKS_FEETAKING':
        return 'FeeTaking'
      default:
        return (poolHookTag as string).toLowerCase().replace('_', ' ')
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
    setPoolHookTags(null)
  }

  const totalFilterCount =
    networks.length +
    poolTypes.length +
    (userAddress ? 1 : 0) +
    (minTvl > 0 ? 1 : 0) +
    poolTags.length +
    (protocolVersion ? 1 : 0) +
    poolHookTags.length

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

  const mappedPoolTags = poolTags.length > 0 ? poolTags : []

  const queryVariables = {
    first,
    skip,
    orderBy,
    orderDirection,
    where: {
      poolTypeIn: mappedPoolTypes,
      chainIn: networks.length > 0 ? networks : PROJECT_CONFIG.supportedNetworks,
      userAddress,
      minTvl,
      tagIn:
        mappedPoolTags.length > 0 || poolHookTags.length > 0
          ? [...mappedPoolTags, ...(poolHookTags || [])]
          : null,
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
    togglePoolHookTag,
    poolTypeLabel,
    setSorting,
    setPagination,
    setSearch,
    setMinTvl,
    setPoolTypes,
    setPoolTags,
    setPoolHookTags,
    resetFilters,
    poolTagLabel,
    poolHookTagLabel,
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
    poolHookTags,
  }
}
