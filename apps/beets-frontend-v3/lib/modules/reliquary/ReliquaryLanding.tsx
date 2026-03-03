'use client'

import { Flex, SimpleGrid, Skeleton, VStack } from '@chakra-ui/react';
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
  const { isConnected, isLoading: isAccountLoading } = useUserAccount()
  const { relicPositions, isLoadingRelicPositions } = useReliquary()
  const searchParams = useSearchParams()
  const focusRelicId = searchParams.get('focusRelic')

  const hasRelics = relicPositions.length > 0
  const isLoading = isAccountLoading || isLoadingRelicPositions

  return (
    <VStack py="4" gap="32" width="full">
      <MaBeetsHeader />
      {isLoading ? (
        <LoadingSkeletons />
      ) : (
        <Content focusRelicId={focusRelicId} hasRelics={hasRelics} isConnected={isConnected} />
      )}
    </VStack>
  );
}

function Content({
  hasRelics,
  focusRelicId,
  isConnected }: {
  hasRelics: boolean
  focusRelicId?: string | null
  isConnected: boolean
}) {
  const [showCharts, setShowCharts] = useState<boolean>(!hasRelics)
  const toggleCharts = () => setShowCharts(!showCharts)

  return (
    <VStack gap="20" width="full">
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="16" width="full">
        {hasRelics ? <YourMaBeetsStats /> : <HowToParticipate />}
        <MaBeetsNumbers chartsVisible={showCharts} onToggleShowMore={toggleCharts} />
      </Flex>
      {showCharts && <MaBeetsCharts />}
      <MyRelicsSection focusRelicId={focusRelicId} isConnected={isConnected} />
      <ReliquaryFaq />
    </VStack>
  );
}

function LoadingSkeletons() {
  return (
    <VStack gap="20" width="full">
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap="16" width="full">
        <VStack align="flex-start" flex="1" gap="4" width="full">
          <Skeleton height="32px" width="200px" />
          <SimpleGrid columns={2} gap={{ base: 'sm', md: 'md' }} w="full">
            {[...Array(6)].map((_, i) => (
              <Skeleton height="65px" key={`your-stats-${i}`} width="full" />
            ))}
          </SimpleGrid>
        </VStack>
        <VStack align="flex-start" flex="1" gap="4" width="full">
          <Skeleton height="32px" width="180px" />
          <SimpleGrid columns={2} gap={{ base: 'sm', md: 'md' }} w="full">
            {[...Array(6)].map((_, i) => (
              <Skeleton height="65px" key={`numbers-${i}`} width="full" />
            ))}
          </SimpleGrid>
          <Skeleton alignSelf="flex-end" height="18px" width="80px" />
        </VStack>
      </Flex>
      <VStack align="flex-start" gap="4" width="full">
        <Skeleton height="32px" width="120px" />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4" w="full">
          {[...Array(3)].map((_, i) => (
            <Skeleton height="120px" key={`relic-${i}`} width="full" />
          ))}
        </SimpleGrid>
      </VStack>
      <VStack align="flex-start" gap="4" width="full">
        <Skeleton height="32px" width="200px" />
        <Skeleton height="150px" width="full" />
      </VStack>
      <VStack align="flex-start" gap="4" width="full">
        <Skeleton height="32px" width="80px" />
        <VStack gap="3" width="full">
          {[...Array(4)].map((_, i) => (
            <Skeleton height="60px" key={`faq-${i}`} width="full" />
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}
