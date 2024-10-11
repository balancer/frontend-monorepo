'use client'

import { Stack } from '@chakra-ui/react'
import { VebalStats } from '@/lib/modules/vebal/VebalStats/VebalStats'
import { VeBALLocksChart } from '@/lib/modules/vebal/vebal-chart/VebalLocksChart'

export function VebalStatsLayout() {
  return (
    <Stack w="full" spacing="md" direction={{ base: 'column', md: 'row' }} justifyContent="stretch">
      <VebalStats w={{ base: 'full', md: 'md' }} />
      <VeBALLocksChart w="full" h={{ base: 'md', md: 'auto' }} />
    </Stack>
  )
}
