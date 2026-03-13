'use client'

import { Grid, GridItem, GridProps, Icon, Text, VStack } from '@chakra-ui/react'
import { GqlPoolOrderBy } from '@repo/lib/shared/services/api/generated/graphql'
import { orderByHash, PoolsColumnSort } from '../../pool.types'
import { usePoolOrderByState } from '../usePoolOrderByState'
import { Globe } from 'react-feather'
import { SortableHeader, Sorting } from '@repo/lib/shared/components/tables/SortableHeader'
import { usePoolList } from '../PoolListProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PoolListPoolNamesTokens } from './PoolListPoolNamesTokens'

const setIsDesc = (id: GqlPoolOrderBy, currentSortingObj: PoolsColumnSort) =>
  currentSortingObj.id === id ? !currentSortingObj.desc : true

export function PoolListTableHeader({ ...rest }: GridProps) {
  const {
    queryState: { sorting, setSorting },
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

  return (
    <Grid {...rest} p={['sm', 'md']} w="full">
      <GridItem>
        <VStack align="start" w="full">
          <Icon as={Globe} boxSize="5" color="font.primary" />
        </VStack>
      </GridItem>
      <GridItem>
        {PROJECT_CONFIG.options.showPoolName ? (
          <PoolListPoolNamesTokens />
        ) : (
          <Text fontWeight="bold">Pool name</Text>
        )}
      </GridItem>
      <GridItem justifySelf="start">
        <Text fontWeight="bold" textAlign="left">
          Details
        </Text>
      </GridItem>
      {orderBy.map((orderByItem, index) => (
        <GridItem
          justifySelf="end"
          key={orderByItem}
          position="relative"
          pr={index === orderBy.length - 1 ? { base: 'md', sm: 'lg', lg: 'sm', xl: '0' } : '0'}
          right="-6px"
        >
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
