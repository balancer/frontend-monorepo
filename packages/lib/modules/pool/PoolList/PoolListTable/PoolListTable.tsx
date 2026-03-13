'use client'

import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { PoolListTableHeader } from './PoolListTableHeader'
import { PoolListTableRow } from './PoolListTableRow'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { PoolListItem } from '../../pool.types'
import { Box, Card, Portal, Skeleton } from '@chakra-ui/react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useStickyTopOffset } from '@repo/lib/shared/hooks/useStickyTopOffset'
import { usePoolList } from '../PoolListProvider'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  pools: PoolListItem[]
  count: number
  loading: boolean
}

const STICKY_HEADER_BOTTOM_BUFFER_PX = 100

export function PoolListTable({ pools, count, loading }: Props) {
  const isMounted = useIsMounted()
  const stickyTopOffset = useStickyTopOffset()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const stickyOuterRef = useRef<HTMLDivElement | null>(null)
  const stickyInnerRef = useRef<HTMLDivElement | null>(null)
  // Only boolean drives React render (CSS opacity transition); layout is mutated directly
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const stickyTopOffsetRef = useRef(stickyTopOffset)
  useEffect(() => {
    stickyTopOffsetRef.current = stickyTopOffset
  }, [stickyTopOffset])
  const {
    queryState: { pagination, setPagination, userAddress },
  } = usePoolList()
  const paginationProps = getPaginationProps(count || 0, pagination, setPagination)
  const showPagination = !!pools.length && !!count && count > pagination.pageSize

  const numberColumnWidth = userAddress ? '120px' : '175px'
  const furthestLeftColWidth = '120px'

  const rowProps = useMemo(
    () => ({
      px: { base: 'sm', sm: '0' },
      gridTemplateColumns: `32px minmax(320px, 1fr) 180px ${
        userAddress ? furthestLeftColWidth : ''
      } ${userAddress ? numberColumnWidth : furthestLeftColWidth} ${numberColumnWidth} 200px`,
      alignItems: 'center',
      gap: { base: 'xxs', xl: 'lg' },
    }),
    [userAddress, furthestLeftColWidth, numberColumnWidth]
  )

  const needsMarginForPoints = pools.some(pool => pool.tags?.some(tag => tag && tag === 'POINTS'))

  const renderTableRow = useCallback(
    ({ item, index }: { item: PoolListItem; index: number }) => (
      <PoolListTableRow
        keyValue={index}
        needsMarginForPoints={needsMarginForPoints}
        pool={item}
        {...rowProps}
      />
    ),
    [needsMarginForPoints, rowProps]
  )

  const renderTableHeader = useCallback(() => <PoolListTableHeader {...rowProps} />, [rowProps])

  useEffect(() => {
    const card = cardRef.current

    if (!card) return

    let frameId: number | undefined

    const updateStickyHeader = () => {
      const outer = stickyOuterRef.current
      const inner = stickyInnerRef.current
      const rect = card.getBoundingClientRect()
      const scrollTop = window.scrollY || window.pageYOffset
      const currentTopOffset = stickyTopOffsetRef.current
      const cardTop = rect.top + scrollTop
      const cardBottom = cardTop + card.offsetHeight
      const stickyBoundary = scrollTop + currentTopOffset
      const nextShowStickyHeader =
        stickyBoundary >= cardTop && stickyBoundary < cardBottom - STICKY_HEADER_BOTTOM_BUFFER_PX

      // Direct DOM mutation for layout — no React re-render on every scroll frame
      if (outer) {
        outer.style.top = `${currentTopOffset}px`
        outer.style.left = `${rect.left}px`
        outer.style.width = `${card.clientWidth}px`
      }
      if (inner) {
        inner.style.transform = `translateX(-${card.scrollLeft}px)`
        inner.style.width = `${card.scrollWidth}px`
      }

      setShowStickyHeader(prev => (prev === nextShowStickyHeader ? prev : nextShowStickyHeader))
    }

    const scheduleUpdate = () => {
      if (frameId !== undefined) return

      frameId = window.requestAnimationFrame(() => {
        frameId = undefined
        updateStickyHeader()
      })
    }

    scheduleUpdate()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    document.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true })
    window.addEventListener('resize', scheduleUpdate)
    card.addEventListener('scroll', scheduleUpdate, { passive: true })

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(card)

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
      }

      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      document.removeEventListener('scroll', scheduleUpdate, true)
      window.removeEventListener('resize', scheduleUpdate)
      card.removeEventListener('scroll', scheduleUpdate)
    }
  }, [])

  if (!isMounted) return <Skeleton height="500px" w="full" />

  return (
    <>
      <Portal>
        <Box
          opacity={showStickyHeader ? 1 : 0}
          pointerEvents={showStickyHeader ? 'auto' : 'none'}
          position="fixed"
          ref={stickyOuterRef}
          shadow="xl"
          style={{ left: '0px', top: '0px', width: '0px' }}
          transition={showStickyHeader ? 'opacity 0.3s var(--ease-out-cubic)' : 'opacity 0s'}
          visibility={showStickyHeader ? 'visible' : 'hidden'}
          willChange="opacity"
          zIndex={11}
        >
          <Box overflow="hidden">
            <Box ref={stickyInnerRef} style={{ transform: 'translateX(0px)', width: '0px' }}>
              <Box bg="background.level1">
                <PoolListTableHeader {...rowProps} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Portal>

      <Card
        alignItems="flex-start"
        left={{ base: '-4px', sm: '0' }}
        overflowX={{ base: 'auto', '2xl': 'hidden' }}
        overflowY="hidden"
        p={{ base: '0', sm: '0' }}
        position="relative"
        // fixing right padding for horizontal scroll on mobile
        pr={{ base: 'lg', sm: 'lg', md: 'lg', lg: '0' }}
        ref={cardRef}
        w={{ base: '100vw', lg: 'full' }}
      >
        <Box minW="max-content" w="full">
          <PaginatedTable
            getRowId={item => item.id}
            items={pools}
            loading={loading}
            noItemsFoundLabel="No pools found"
            paginationProps={paginationProps}
            renderTableHeader={renderTableHeader}
            renderTableRow={renderTableRow}
            showPagination={showPagination}
          />
        </Box>
      </Card>
    </>
  )
}
