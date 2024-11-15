'use client'

import { Grid, GridItem, Icon, Text, VStack } from '@chakra-ui/react'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { orderByHash, SortingBy } from '@repo/lib/modules/vebal/vote/vote.types'

const orderBy = Object.values(SortingBy)

export function VoteListTableHeader({ ...rest }) {
  const {
    filtersState: { sorting, setSorting, sortingBy, setSortingBy, toggleSorting },
  } = useVoteList()

  const handleSort = (newSortingBy: SortingBy) => {
    if (sortingBy === newSortingBy) {
      toggleSorting()
    } else {
      setSortingBy(newSortingBy)
      setSorting(Sorting.desc)
    }
  }

  return (
    <Grid {...rest} borderBottom="1px solid" borderColor="border.base" p={['sm', 'md']} w="full">
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold">Pool name</Text>
      </GridItem>
      {orderBy.map(orderByItem => (
        <GridItem justifySelf="end" key={orderByItem} maxW="maxContent">
          <SortableHeader
            isSorted={sortingBy === orderByItem}
            label={orderByHash[orderByItem]}
            onSort={() => handleSort(orderByItem)}
            sorting={sorting}
          />
        </GridItem>
      ))}
      <GridItem justifySelf="end" maxW="maxContent">
        <Text fontWeight="bold" textAlign="right">
          Action
        </Text>
      </GridItem>
    </Grid>
  )
}
