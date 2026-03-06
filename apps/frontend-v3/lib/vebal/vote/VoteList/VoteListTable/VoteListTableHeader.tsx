'use client'

import { Grid, GridItem, Icon, Text, VStack, Popover } from '@chakra-ui/react'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { useVoteList } from '@bal/lib/vebal/vote/VoteList/VoteListProvider'
import { SortVotesBy } from '@repo/lib/modules/vebal/vote/vote.types'
import { orderByHash } from '@repo/lib/modules/vebal/vote/vote.helpers'

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
    <Grid {...rest} p={['sm', 'md']} w="full">
      <GridItem>
        <VStack align="start" w="full">
          <Icon asChild boxSize="5" color="font.primary">
            <Globe />
          </Icon>
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" pl="2px">
          Pool name
        </Text>
      </GridItem>
      {orderBy.map(orderByItem => (
        <GridItem
          justifySelf={orderByItem === 'type' ? 'start' : 'end'}
          key={orderByItem}
          left={orderByItem === 'type' ? '-16px' : '0'}
          maxW="maxContent"
          position="relative"
        >
          <SortableHeader
            containerProps={{
              position: 'relative',
              right: '-10px',
            }}
            isSorted={sortVotesBy === orderByItem}
            label={orderByHash[orderByItem].label}
            onSort={() => handleSort(orderByItem)}
            popoverContent={
              orderByHash[orderByItem].title ? (
                <Popover.Positioner>
                  <Popover.Content maxW="300px" p="sm" w="auto">
                    <Text
                      fontSize="sm"
                      textAlign={
                        ['bribes', 'bribesPerVebal'].includes(orderByItem) ? 'left' : undefined
                      }
                      variant="secondary"
                    >
                      {orderByHash[orderByItem].title}
                    </Text>
                  </Popover.Content>
                </Popover.Positioner>
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
