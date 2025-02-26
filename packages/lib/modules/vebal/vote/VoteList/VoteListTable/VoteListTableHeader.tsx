'use client'

import { Grid, GridItem, Icon, PopoverContent, Text, VStack } from '@chakra-ui/react'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { SortVotesBy } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderByHash } from '../../vote.helpers'

const orderBy = Object.values(SortVotesBy)

export function VoteListTableHeader({ ...rest }) {
  const {
    filtersState: { sorting, setSorting, sortVotesBy, setSortVotesBy, toggleSorting },
  } = useVoteList()

  const handleSort = (newSortVotesBy: SortVotesBy) => {
    if (sortVotesBy === newSortVotesBy) {
      toggleSorting()
    } else {
      setSortVotesBy(newSortVotesBy)
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
        <GridItem
          justifySelf={orderByItem === 'type' ? 'start' : 'end'}
          key={orderByItem}
          maxW="maxContent"
        >
          <SortableHeader
            isSorted={sortVotesBy === orderByItem}
            label={orderByHash[orderByItem].label}
            onSort={() => handleSort(orderByItem)}
            popoverContent={
              orderByHash[orderByItem].title ? (
                <PopoverContent maxW="300px" p="sm" w="auto">
                  <Text
                    fontSize="sm"
                    textAlign={
                      ['bribes', 'bribesPerVebal'].includes(orderByItem) ? 'left' : undefined
                    }
                    variant="secondary"
                  >
                    {orderByHash[orderByItem].title}
                  </Text>
                </PopoverContent>
              ) : undefined
            }
            sorting={sorting}
            textProps={orderByItem === 'type' ? { textAlign: 'left' } : undefined}
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
