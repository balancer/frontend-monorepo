'use client'

import { Divider, Grid, GridItem, Text } from '@chakra-ui/react'
import { usePoolActivity } from '../PoolActivity/usePoolActivity'
import { Sorting, SortingBy } from '../PoolActivity/poolActivity.types'
import { SortableHeader } from '@repo/lib/shared/components/tables/SortableHeader'

export function PoolActivityTableHeader({ ...rest }) {
  const {
    setSortingBy,
    isSortedByTime,
    isSortedByValue,
    toggleSorting,
    setSorting,
    sortingBy,
    sorting,
    isSortedByAction,
    setSkip,
  } = usePoolActivity()

  const handleSort = (newSortingBy: SortingBy) => {
    if (sortingBy === newSortingBy) {
      toggleSorting()
    } else {
      setSortingBy(newSortingBy)
      setSorting(newSortingBy === SortingBy.action ? Sorting.asc : Sorting.desc)
      setSkip(0)
    }
  }

  return (
    <>
      <Divider w="full" />
      <Grid {...rest} px={['sm', 'ms']} py="xs" w="full">
        <GridItem>
          <Text fontWeight="bold">User</Text>
        </GridItem>
        <SortableHeader
          isSorted={isSortedByAction}
          label="Action"
          onSort={handleSort}
          sorting={sorting}
        />
        <GridItem>
          <Text fontWeight="bold">Transaction details</Text>
        </GridItem>
        <SortableHeader
          align="right"
          isSorted={isSortedByValue}
          label="Value"
          onSort={handleSort}
          sorting={sorting}
        />
        <SortableHeader
          align="right"
          isSorted={isSortedByTime}
          label="Time"
          onSort={handleSort}
          sorting={sorting}
        />
      </Grid>
      <Divider w="full" />
    </>
  )
}
