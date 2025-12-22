'use client'

import { Flex, VStack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MaBeetsCharts } from './components/charts/MaBeetsCharts'
import { HowToParticipate } from './components/landing/HowToParticipate'
import { MaBeetsHeader } from './components/landing/MaBeetsHeader'
import { MyRelicsSection } from './components/landing/MyRelicsSection'
import { ReliquaryFaq } from './components/landing/ReliquaryFaq'
import { MaBeetsNumbers } from './components/stats/MaBeetsNumbers'
import { YourMaBeetsStats } from './components/stats/YourMaBeetsStats'
import { useReliquary } from './ReliquaryProvider'

export default function ReliquaryLanding() {
  const { isConnected } = useUserAccount()
  const { relicPositions, isLoadingRelicPositions } = useReliquary()
  const searchParams = useSearchParams()
  const focusRelicId = searchParams.get('focusRelic')

  const hasRelics = relicPositions.length > 0

  return (
    <VStack py="4" spacing="32" width="full">
      {/* Header */}
      <MaBeetsHeader />
      {!isLoadingRelicPositions && (
        <Content focusRelicId={focusRelicId} hasRelics={hasRelics} isConnected={isConnected} />
      )}
    </VStack>
  )
}

function Content({
  hasRelics,
  focusRelicId,
  isConnected,
}: {
  hasRelics: boolean
  focusRelicId?: string | null
  isConnected: boolean
}) {
  const [showCharts, setShowCharts] = useState<boolean>(!hasRelics)
  const toggleCharts = () => setShowCharts(!showCharts)
  return (
    <VStack spacing="20" width="full">
      {/* Stats Grid */}
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="16" width="full">
        {hasRelics ? <YourMaBeetsStats /> : <HowToParticipate />}
        <MaBeetsNumbers chartsVisible={showCharts} onToggleShowMore={toggleCharts} />
      </Flex>

      {/* Charts - conditional visibility */}
      {showCharts && <MaBeetsCharts />}

      {/* Relics and Voting Power Sections */}
      <MyRelicsSection focusRelicId={focusRelicId} isConnected={isConnected} />

      {/* FAQ Section */}
      <ReliquaryFaq />
    </VStack>
  )
}
