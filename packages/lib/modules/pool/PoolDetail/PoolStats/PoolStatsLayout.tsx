'use client'

import { Stack } from '@chakra-ui/react'
import { PoolCharts } from './PoolCharts/PoolCharts'
import { PoolSnapshot } from './PoolSnapshot/PoolSnapshot'

export function PoolStatsLayout() {
  return (
    <Stack w="full" spacing="md" direction={{ base: 'column', md: 'row' }} justifyContent="stretch">
      <PoolSnapshot w={{ base: 'full', md: 'md' }} />
      <PoolCharts />
    </Stack>
  )
}
