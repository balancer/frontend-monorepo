'use client'

import {
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  Icon,
  PopoverContent,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Globe, Trash2 } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { SortingBy } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.types'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { orderByHash } from '../myVotes.helpers'
const orderBy = Object.values(SortingBy)

interface Props extends GridProps {
  cellProps: GridItemProps
}

export function MyVotesTableHeader({ cellProps, ...rest }: Props) {
  const {
    filtersState: { sorting, setSorting, sortingBy, setSortingBy, toggleSorting },
  } = useMyVotes()

  const handleSort = (newSortingBy: SortingBy) => {
    if (sortingBy === newSortingBy) {
      toggleSorting()
    } else {
      setSortingBy(newSortingBy)
      setSorting(Sorting.desc)
    }
  }

  return (
    <Grid {...rest} p={['sm', 'md']} w="full">
      <GridItem {...cellProps}>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem {...cellProps}>
        <Text fontWeight="bold" pl="2px">
          Pool name
        </Text>
      </GridItem>
      {orderBy.map(orderByItem => (
        <SortableHeader
          containerProps={{
            justifySelf: 'end',
            textAlign: 'right',
            ...cellProps,
            position: 'relative',
            right: '-8px',
          }}
          isSorted={sortingBy === orderByItem}
          key={orderByItem}
          label={orderByHash[orderByItem].label}
          onSort={() => handleSort(orderByItem)}
          popoverContent={
            orderByHash[orderByItem].title ? (
              <PopoverContent maxW="300px" p="sm" w="auto">
                <Text
                  fontSize="sm"
                  textAlign={
                    ['bribes', 'bribesPerVebal', 'currentVotes'].includes(orderByItem)
                      ? 'left'
                      : undefined
                  }
                  variant="secondary"
                >
                  {orderByHash[orderByItem].title}
                </Text>
              </PopoverContent>
            ) : undefined
          }
          sorting={sorting}
        />
      ))}
      <GridItem {...cellProps}>
        <VStack align="center" w="full">
          <Icon as={Trash2} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
    </Grid>
  )
}
