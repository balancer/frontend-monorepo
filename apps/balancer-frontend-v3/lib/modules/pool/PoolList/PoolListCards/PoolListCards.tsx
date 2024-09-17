'use client'

import { Box, Center, Grid, Skeleton, Text } from '@chakra-ui/react'
import { PoolListCard } from './PoolListCard'
import { Pagination } from '@/lib/shared/components/pagination/Pagination'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { getPaginationProps } from '@/lib/shared/components/pagination/getPaginationProps'
import { PoolListItem } from '../../pool.types'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'

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
    <Box w="full" style={{ position: 'relative' }}>
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} w="full" gap="4">
        {pools.map(pool => (
          <PoolListCard key={pool.id} pool={pool} />
        ))}
      </Grid>

      {!loading && pools.length === 0 && (
        <Center
          py="2xl"
          border="1px"
          borderStyle="dashed"
          borderColor="border.base"
          borderRadius="md"
        >
          <Text color="font.secondary">No pools found</Text>
        </Center>
      )}
      {loading && (
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} w="full" gap="4">
          <Skeleton w="full" h="350px" />
          <Skeleton w="full" h="350px" />
          <Skeleton w="full" h="350px" />
          <Skeleton w="full" h="350px" />
        </Grid>
      )}

      {showPagination && <Pagination {...paginationProps} />}
    </Box>
  )
}
