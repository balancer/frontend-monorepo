'use client'

import { Stack } from '@chakra-ui/react'
import { VebalStats } from '@repo/lib/modules/vebal/VebalStats/VebalStats'
import { VeBALLocksChart } from '@repo/lib/modules/vebal/vebal-chart/VebalLocksChart'

export function VebalStatsLayout() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="stretch" spacing="md" w="full">
      <VebalStats w={{ base: 'full', md: 'md' }} />
      <VeBALLocksChart h={{ base: 'md', md: 'auto' }} w="full" />
    </Stack>
  )
}
