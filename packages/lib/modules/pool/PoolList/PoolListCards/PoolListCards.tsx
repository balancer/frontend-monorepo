'use client'

import { Box, Center, Grid, Skeleton, Text } from '@chakra-ui/react'
import { PoolListCard } from './PoolListCard'
import { Pagination } from '@repo/lib/shared/components/pagination/Pagination'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { PoolListItem } from '../../pool.types'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'

interface Props {
  pools: PoolListItem[]
  count: number
  loading: boolean
}

export function PoolListCards({ pools, count, loading }: Props) {
  const isMounted = useIsMounted()
  const { pagination, setPagination } = usePoolListQueryState()
  const paginationProps = getPaginationProps(count, pagination, setPagination)
  const showPagination = !!pools.length && !!count && count > pagination.pageSize

  if (!isMounted) return <Skeleton height="500px" w="full" />

  return (
    <Box style={{ position: 'relative' }} w="full">
      <Grid gap="4" templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} w="full">
        {pools.map(pool => (
          <PoolListCard key={pool.id} pool={pool} />
        ))}
      </Grid>

      {!loading && pools.length === 0 && (
        <Center
          border="1px"
          borderColor="border.base"
          borderRadius="md"
          borderStyle="dashed"
          py="2xl"
        >
          <Text color="font.secondary">No pools found</Text>
        </Center>
      )}
      {loading && (
        <Grid gap="4" templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} w="full">
          <Skeleton h="350px" w="full" />
          <Skeleton h="350px" w="full" />
          <Skeleton h="350px" w="full" />
          <Skeleton h="350px" w="full" />
        </Grid>
      )}

      {showPagination && <Pagination {...paginationProps} />}
    </Box>
  )
}
