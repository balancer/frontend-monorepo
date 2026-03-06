'use client'

import { Stack } from '@chakra-ui/react'
import { PoolSnapshot } from './PoolSnapshot/PoolSnapshot'
import { PoolChartsContainer } from './PoolCharts/PoolChartsContainer'

export function PoolStatsLayout() {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap="md"
      h={{ md: '484px' }}
      justifyContent="stretch"
      w="full"
    >
      <PoolSnapshot w={{ base: 'full', md: 'md' }} />
      <PoolChartsContainer />
    </Stack>
  )
}
