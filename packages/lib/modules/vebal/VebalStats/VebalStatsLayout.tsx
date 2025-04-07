'use client'

import { Skeleton, Stack } from '@chakra-ui/react'
import { VebalStats } from '@repo/lib/modules/vebal/VebalStats/VebalStats'
import { VebalLocksChart } from '@repo/lib/modules/vebal/vebal-chart/VebalLocksChart'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/useVebalLockInfo'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { useMemo } from 'react'

export function VebalStatsLayout() {
  const lockInfo = useVebalLockInfo()
  const { isLoading, snapshots } = useVebalUserData()

  const lockSnapshots = useMemo(() => snapshots || [], [snapshots])

  return (
    <Stack direction={{ base: 'column', md: 'row' }} justifyContent="stretch" spacing="md" w="full">
      <VebalStats w={{ base: 'full', md: 'md' }} />
      {isLoading || lockInfo.isLoading ? (
        <Skeleton h={{ base: 'md', md: 'auto' }} w="full" />
      ) : (
        <VebalLocksChart
          h={{ base: 'md', md: 'auto' }}
          lockSnapshots={lockSnapshots}
          mainnetLockedInfo={lockInfo.mainnetLockedInfo}
          w="full"
        />
      )}
    </Stack>
  )
}
