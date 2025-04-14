'use client'

import { Stack } from '@chakra-ui/react'
import { PoolSnapshot } from './PoolSnapshot/PoolSnapshot'
import { PoolChartsContainer } from './PoolCharts/PoolChartsContainer'

export function PoolStatsLayout() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="stretch" spacing="md" w="full">
      <PoolSnapshot w={{ base: 'full', md: 'md' }} />
      <PoolChartsContainer />
    </Stack>
  )
}
