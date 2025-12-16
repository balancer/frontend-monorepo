'use client'

import { Flex, VStack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { MyRelicsSection } from './components/landing/MyRelicsSection'
import { MaBeetsHeader } from './components/landing/MaBeetsHeader'
import { HowToParticipate } from './components/landing/HowToParticipate'
import { YourMaBeetsStats } from './components/stats/YourMaBeetsStats'
import { MaBeetsNumbers } from './components/stats/MaBeetsNumbers'
import { MaBeetsCharts } from './components/charts/MaBeetsCharts'
import { useReliquary } from './ReliquaryProvider'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ReliquaryLanding() {
  const { isConnected } = useUserAccount()
  const { relicPositions } = useReliquary()
  const searchParams = useSearchParams()
  const focusRelicId = searchParams.get('focusRelic')

  const hasRelics = isConnected && relicPositions.length > 0
  const [showCharts, setShowCharts] = useState(false)

  // Charts shown by default if no relics, hidden if has relics
  const shouldShowCharts = !hasRelics || showCharts

  const toggleCharts = () => setShowCharts(!showCharts)

  return (
    <VStack py="4" spacing="8" width="full">
      {/* Header */}
      <MaBeetsHeader />

      {/* Stats Grid */}
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="8" width="full">
        {hasRelics ? <YourMaBeetsStats /> : <HowToParticipate />}
        <MaBeetsNumbers onToggleShowMore={toggleCharts} showMore={showCharts} />
      </Flex>

      {/* Charts - conditional visibility */}
      {shouldShowCharts && <MaBeetsCharts />}

      {/* Relics and Voting Power Sections */}
      <MyRelicsSection focusRelicId={focusRelicId} />
    </VStack>
  )
}
