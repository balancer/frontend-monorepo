'use client'

import { VStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Governance } from '@analytics/app/_components/Governance'
import { BalSupplyByChainCard } from './BalSupplyByChainCard'
import { GovernanceHeroStrip } from './GovernanceHeroStrip'
import { VeBalHoldersTable } from './VeBalHoldersTable'

export function GovernanceView() {
  return (
    <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
      <FadeInOnView animateOnce={false}>
        <GovernanceHeroStrip />
      </FadeInOnView>

      <FadeInOnView animateOnce={false}>
        <BalSupplyByChainCard />
      </FadeInOnView>

      <FadeInOnView animateOnce={false}>
        <VeBalHoldersTable />
      </FadeInOnView>

      <FadeInOnView animateOnce={false}>
        <Governance subtitle="Snapshot · last 10 proposals" title="Recent proposals" />
      </FadeInOnView>
    </VStack>
  )
}
