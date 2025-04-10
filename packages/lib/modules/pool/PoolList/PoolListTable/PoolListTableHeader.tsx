'use client'

import { Grid, GridItem, Icon, Text, HStack, VStack, Switch } from '@chakra-ui/react'
import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { orderByHash, PoolDisplayType, PoolsColumnSort } from '../../pool.types'
import { usePoolOrderByState } from '../usePoolOrderByState'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { usePoolList } from '../PoolListProvider'

const setIsDesc = (id: GqlPoolOrderBy, currentSortingObj: PoolsColumnSort) =>
  currentSortingObj.id === id ? !currentSortingObj.desc : true

export function PoolListTableHeader({ ...rest }) {
  const {
    queryState: { sorting, setSorting },
    setPoolDisplayType,
  } = usePoolList()
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

  function togglePoolDisplayType() {
    setPoolDisplayType(prev =>
      prev === PoolDisplayType.Name ? PoolDisplayType.TokenPills : PoolDisplayType.Name
    )
  }

  return (
    <Grid {...rest} borderBottom="1px solid" borderColor="border.base" p={['sm', 'md']} w="full">
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        <HStack align="start" w="full">
          <Text fontWeight="bold">Pool name</Text>
          <HStack ml="auto" spacing="xs">
            <Text fontSize="sm" variant="secondary">
              Show tokens?
            </Text>
            <Switch onChange={togglePoolDisplayType} size="sm" />
          </HStack>
        </HStack>
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Details
        </Text>
      </GridItem>
      {orderBy.map(orderByItem => (
        <GridItem justifySelf="end" key={orderByItem}>
          <SortableHeader
            isSorted={sortingObj.id === orderByItem}
            label={orderByHash[orderByItem]}
            onSort={() => handleSort(orderByItem)}
            sorting={sortingObj.desc ? Sorting.desc : Sorting.asc}
          />
        </GridItem>
      ))}
    </Grid>
  )
}
