'use client'

import { Flex, SimpleGrid, Skeleton, VStack } from '@chakra-ui/react'
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
      <MaBeetsHeader />
      {isLoadingRelicPositions ? (
        <LoadingSkeletons />
      ) : (
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
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="16" width="full">
        {hasRelics ? <YourMaBeetsStats /> : <HowToParticipate />}
        <MaBeetsNumbers chartsVisible={showCharts} onToggleShowMore={toggleCharts} />
      </Flex>
      {showCharts && <MaBeetsCharts />}
      <MyRelicsSection focusRelicId={focusRelicId} isConnected={isConnected} />
      <ReliquaryFaq />
    </VStack>
  )
}

function LoadingSkeletons() {
  return (
    <VStack spacing="20" width="full">
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="16" width="full">
        <VStack align="flex-start" flex="1" spacing="4" width="full">
          <Skeleton height="32px" width="200px" />
          <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
            {[...Array(6)].map((_, i) => (
              <Skeleton height="65px" key={`your-stats-${i}`} width="full" />
            ))}
          </SimpleGrid>
        </VStack>
        <VStack align="flex-start" flex="1" spacing="4" width="full">
          <Flex justify="space-between" width="full">
            <Skeleton height="32px" width="180px" />
            <Skeleton height="20px" width="80px" />
          </Flex>
          <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
            {[...Array(6)].map((_, i) => (
              <Skeleton height="65px" key={`numbers-${i}`} width="full" />
            ))}
          </SimpleGrid>
        </VStack>
      </Flex>
      <VStack align="flex-start" spacing="4" width="full">
        <Skeleton height="32px" width="120px" />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4" w="full">
          {[...Array(3)].map((_, i) => (
            <Skeleton height="120px" key={`relic-${i}`} width="full" />
          ))}
        </SimpleGrid>
      </VStack>
      <VStack align="flex-start" spacing="4" width="full">
        <Skeleton height="32px" width="200px" />
        <Skeleton height="150px" width="full" />
      </VStack>
      <VStack align="flex-start" spacing="4" width="full">
        <Skeleton height="32px" width="80px" />
        <VStack spacing="3" width="full">
          {[...Array(4)].map((_, i) => (
            <Skeleton height="60px" key={`faq-${i}`} width="full" />
          ))}
        </VStack>
      </VStack>
    </VStack>
  )
}
