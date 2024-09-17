/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { PoolVariant } from '../../pool.types'
import { usePool } from '../../PoolProvider'
import { GqlPoolEventType } from '@/lib/shared/services/api/generated/graphql'
import { usePoolEvents } from '../../usePoolEvents'
import { slugToChainMap, ChainSlug } from '../../pool.utils'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { differenceInCalendarDays } from 'date-fns'
import { fNum } from '@/lib/shared/utils/numbers'
import { ButtonGroupOption } from '@/lib/shared/components/btns/button-group/ButtonGroup'
import {
  PoolActivity,
  PoolActivityEl,
  PoolActivityTokens,
  SortingBy,
  getPoolActivityTabsList,
  Sorting,
} from './poolActivity.types'
import { PaginationState } from '@/lib/shared/components/pagination/pagination.types'
import { usePoolActivityViewType } from '../PoolActivityViewType/usePoolActivityViewType'
import { sortAlphabetically } from '@/lib/shared/utils/sorting'

export type PoolActivityResponse = ReturnType<typeof _usePoolActivity>
export const PoolActivityContext = createContext<PoolActivityResponse | null>(null)

const MAX_EVENTS = 500

function _usePoolActivity() {
  const { id: poolId, variant, chain } = useParams()
  const { pool } = usePool()
  const { getToken } = useTokens()
  const [sorting, setSorting] = useState<Sorting>(Sorting.desc)
  const [sortingBy, setSortingBy] = useState<SortingBy>(SortingBy.time)
  const [first, setFirst] = useState(10)
  const [skip, setSkip] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const { isChartView } = usePoolActivityViewType()

  const _chain = slugToChainMap[chain as ChainSlug]

  const tabsList = useMemo(() => {
    const poolType = pool?.type
    if (!poolType || typeof variant !== 'string') return []

    return getPoolActivityTabsList({
      variant: variant as PoolVariant,
      poolType: poolType,
    })
  }, [pool?.type, variant])

  const [activeTab, setActiveTab] = useState<ButtonGroupOption | undefined>(tabsList[0])

  const isAllOrSwaps = activeTab?.value === 'all' || activeTab?.value === 'swaps'
  const isAllOrAdds = activeTab?.value === 'all' || activeTab?.value === 'adds'
  const isAllOrRemoves = activeTab?.value === 'all' || activeTab?.value === 'removes'

  function getTitle() {
    if (activeTab?.value === 'all') {
      return 'transactions'
    }

    return activeTab?.value ?? ''
  }

  const { loading, data: response } = usePoolEvents({
    poolIdIn: [poolId] as string[],
    chainIn: [_chain],
    first: MAX_EVENTS,
    skip: 0,
  })

  const count = response?.poolEvents.length ?? 0

  const minDate = useMemo(() => {
    if (!response) return 0
    return Math.min(...response.poolEvents.map(event => event.timestamp))
  }, [response])

  const maxDate = useMemo(() => {
    if (!response) return 0
    return Math.max(...response.poolEvents.map(event => event.timestamp))
  }, [response])

  const maxYAxisValue = useMemo(() => {
    if (!response) return 0
    return Math.max(...response.poolEvents.map(event => event.valueUSD))
  }, [response])

  const poolActivityData = useMemo(() => {
    if (!response) return { adds: [], removes: [], swaps: [] }
    const { poolEvents: events } = response

    const data = events.reduce(
      (acc: PoolActivity, item) => {
        const { type, timestamp, valueUSD, userAddress, tx } = item

        const usdValue = valueUSD.toString() ?? ''
        const tokens: PoolActivityTokens[] = []

        if (item.__typename === 'GqlPoolAddRemoveEventV3') {
          item.tokens.forEach(token => {
            tokens.push({
              token: getToken(token.address, _chain),
              amount: token.amount,
            })
          })
        }

        if (
          item.__typename === 'GqlPoolSwapEventV3' ||
          item.__typename === 'GqlPoolSwapEventCowAmm'
        ) {
          tokens.push({
            token: getToken(item.tokenIn.address, _chain),
            amount: item.tokenIn.amount,
          })
          tokens.push({
            token: getToken(item.tokenOut.address, _chain),
            amount: item.tokenOut.amount,
          })
        }

        const elToPush = [
          timestamp,
          isExpanded ? usdValue : '0',
          { userAddress, tokens, usdValue, tx, action: 'swap' }, // action will be overwritten again below
        ] as PoolActivityEl

        switch (type) {
          case GqlPoolEventType.Add:
            acc.adds.push([elToPush[0], elToPush[1], { ...elToPush[2], action: 'add' }])
            break
          case GqlPoolEventType.Remove:
            acc.removes.push([elToPush[0], elToPush[1], { ...elToPush[2], action: 'remove' }])
            break
          case GqlPoolEventType.Swap:
            acc.swaps.push([elToPush[0], elToPush[1], { ...elToPush[2], action: 'swap' }])
            break
        }

        return acc
      },
      { adds: [], removes: [], swaps: [] }
    )

    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, isExpanded])

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: skip / first,
      pageSize: first,
    }),
    [skip, first]
  )

  function setPagination(newPagination: PaginationState) {
    setFirst(newPagination.pageSize)
    setSkip(newPagination.pageIndex * newPagination.pageSize)
  }

  function getDateCaption() {
    const diffInDays = differenceInCalendarDays(new Date(), minDate * 1000)
    return diffInDays > 0 ? `in last ${diffInDays} days` : 'today'
  }

  const sortPoolEvents = useCallback(
    (events: PoolActivityEl[], sortBy: SortingBy, order: Sorting) => {
      return [...events].sort((a, b) => {
        let compareValue = a[0] - b[0]

        switch (sortBy) {
          case SortingBy.time:
            compareValue = a[0] - b[0]
            break
          case SortingBy.value:
            compareValue = Number(a[2].usdValue) - Number(b[2].usdValue)
            break
          case SortingBy.action:
            compareValue = sortAlphabetically(a[2].action, b[2].action)
            break
        }

        return order === Sorting.asc ? compareValue : -compareValue
      })
    },
    []
  )

  const poolEvents = useMemo(() => {
    return [
      ...(isAllOrAdds ? poolActivityData.adds : []),
      ...(isAllOrRemoves ? poolActivityData.removes : []),
      ...(isAllOrSwaps ? poolActivityData.swaps : []),
    ]
  }, [poolActivityData, isAllOrAdds, isAllOrRemoves, isAllOrSwaps])

  const sortedPoolEvents = useMemo(() => {
    const sortedEvents = sortPoolEvents(poolEvents, sortingBy, sorting)

    return isChartView
      ? sortedEvents.slice(0, sortedEvents.length)
      : sortedEvents.slice(
          pagination.pageIndex * pagination.pageSize,
          pagination.pageSize * (pagination.pageIndex + 1)
        )
  }, [poolEvents, pagination, sorting, sortingBy, sortPoolEvents, isChartView])

  function toggleSorting() {
    setSorting(sorting === Sorting.asc ? Sorting.desc : Sorting.asc)
  }

  const showPagination = useMemo(() => {
    return !!poolEvents.length && poolEvents.length > pagination.pageSize
  }, [poolEvents, pagination])

  const transactionsLabel = useMemo(() => {
    return `${fNum('integer', poolEvents.length)} ${getTitle()} ${getDateCaption()}`
  }, [poolEvents, getTitle, getDateCaption])

  return {
    isLoading: loading,
    isExpanded,
    dataSize: poolEvents.length,
    activeTab,
    tabsList,
    poolActivityData,
    transactionsLabel,
    pagination,
    sortedPoolEvents,
    count,
    showPagination,
    sorting,
    sortingBy,
    isSortedByTime: sortingBy === SortingBy.time,
    isSortedByValue: sortingBy === SortingBy.value,
    isSortedByAction: sortingBy === SortingBy.action,
    minDate,
    maxDate,
    maxYAxisValue,
    setSorting,
    toggleSorting,
    setSortingBy,
    setActiveTab,
    setIsExpanded,
    getTitle,
    getDateCaption,
    setPagination,
    sortPoolEvents,
    setSkip,
  }
}

export function PoolActivityProvider({ children }: PropsWithChildren) {
  const hook = _usePoolActivity()
  return <PoolActivityContext.Provider value={hook}>{children}</PoolActivityContext.Provider>
}

export const usePoolActivity = (): PoolActivityResponse =>
  useMandatoryContext(PoolActivityContext, 'PoolActivity')
