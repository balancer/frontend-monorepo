'use client'

import { Grid, GridItem, Icon, Text, VStack } from '@chakra-ui/react'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { GqlPoolOrderBy } from '@/lib/shared/services/api/generated/graphql'
import { PoolsColumnSort, orderByHash } from '../../pool.types'
import { usePoolOrderByState } from '../usePoolOrderByState'
import { Globe } from 'react-feather'
import { SortableHeader } from '@/lib/shared/components/tables/SortableHeader'

const setIsDesc = (id: GqlPoolOrderBy, currentSortingObj: PoolsColumnSort) =>
  currentSortingObj.id === id ? !currentSortingObj.desc : true

export function PoolListTableHeader({ ...rest }) {
  const { sorting, setSorting } = usePoolListQueryState()
  const { orderBy } = usePoolOrderByState()
  const sortingObj = sorting[0]

  const handleSort = (newSortingBy: GqlPoolOrderBy) => {
    setSorting([
      {
        id: newSortingBy,
        desc: setIsDesc(newSortingBy, sortingObj),
      },
    ])
  }

  return (
    <Grid {...rest} p={['sm', 'md']} w="full" borderBottom="1px solid" borderColor="border.base">
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold">Pool name</Text>
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Type
        </Text>
      </GridItem>
      {orderBy.map((orderByItem, index) => (
        <GridItem key={index} justifySelf="end">
          <SortableHeader
            label={orderByHash[orderByItem]}
            isSorted={sortingObj.id === orderByItem}
            sorting={sortingObj.desc ? 'desc' : 'asc'}
            onSort={() => handleSort(orderByItem)}
          />
        </GridItem>
      ))}
    </Grid>
  )
}
