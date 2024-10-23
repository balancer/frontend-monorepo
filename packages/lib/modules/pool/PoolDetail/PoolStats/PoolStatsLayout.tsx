'use client'

import { Stack } from '@chakra-ui/react'
import { PoolCharts } from './PoolCharts/PoolCharts'
import { PoolSnapshot } from './PoolSnapshot/PoolSnapshot'

export function PoolStatsLayout() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="stretch" spacing="md" w="full">
      <PoolSnapshot w={{ base: 'full', md: 'md' }} />
      <PoolCharts />
    </Stack>
  )
}
