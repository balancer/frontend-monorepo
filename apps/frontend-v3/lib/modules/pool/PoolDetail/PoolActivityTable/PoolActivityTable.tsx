'use client'

import { PaginatedTable } from '@/lib/shared/components/tables/PaginatedTable'
import { PoolActivityTableHeader } from './PoolActivityTableHeader'
import { PoolActivityTableRow } from './PoolActivityTableRow'
import { getPaginationProps } from '@/lib/shared/components/pagination/getPaginationProps'
import { Box, Skeleton } from '@chakra-ui/react'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'
import { usePoolActivity } from '../PoolActivity/usePoolActivity'
import { PoolActivityEl } from '../PoolActivity/poolActivity.types'
import { Pagination } from '@/lib/shared/components/pagination/Pagination'

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

  return (
    <>
      <Box overflowX="auto" w="full" className="hide-scrollbar">
        <Box minWidth="800px">
          <PaginatedTable
            items={sortedPoolEvents}
            loading={isLoading}
            renderTableHeader={() => <PoolActivityTableHeader {...rowProps} />}
            renderTableRow={(item: PoolActivityEl, index) => {
              return <PoolActivityTableRow keyValue={index} event={item} {...rowProps} />
            }}
            showPagination={false}
            paginationProps={paginationProps}
            w="full"
            alignItems="flex-start"
            position="relative"
            noItemsFoundLabel="No pool events found"
          />
        </Box>
      </Box>
      {showPagination && <Pagination {...paginationProps} />}
    </>
  )
}
