'use client'

import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { PoolActivityTableHeader } from './PoolActivityTableHeader'
import { PoolActivityTableRow } from './PoolActivityTableRow'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { Box, Skeleton } from '@chakra-ui/react'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { usePoolActivity } from '../PoolActivity/usePoolActivity'
import { PoolActivityEl } from '../PoolActivity/poolActivity.types'
import { Pagination } from '@repo/lib/shared/components/pagination/Pagination'

export function PoolActivityTable() {
  const isMounted = useIsMounted()
  const { sortedPoolEvents, pagination, setPagination, isLoading, count, showPagination } =
    usePoolActivity()
  const paginationProps = {
    ...getPaginationProps(count, pagination, setPagination, false),
    isSmall: true,
  }

  const rowProps = {
    px: { base: 'sm', sm: '0' },
    gridTemplateColumns: {
      base: '165px 85px 1fr 65px 175px',
      lg: '200px 100px 1fr 100px 200px',
    },
    alignItems: 'center',
    gap: { base: 'xxs', xl: 'lg' },
  }

  if (!isMounted) return <Skeleton height="500px" w="full" />

  const items = sortedPoolEvents.map(item => ({
    ...item,
    id: item[2].id,
  }))

  return (
    <>
      <Box className="hide-scrollbar" overflowX="auto" w="full">
        <Box minWidth="800px">
          <PaginatedTable
            alignItems="flex-start"
            items={items}
            loading={isLoading}
            noItemsFoundLabel="No pool events found"
            paginationProps={paginationProps}
            position="relative"
            renderTableHeader={() => <PoolActivityTableHeader {...rowProps} />}
            renderTableRow={(item: PoolActivityEl, index) => {
              return <PoolActivityTableRow event={item} keyValue={index} {...rowProps} />
            }}
            showPagination={false}
            w="full"
          />
        </Box>
      </Box>
      {showPagination && <Pagination {...paginationProps} />}
    </>
  )
}
