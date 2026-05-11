'use client'

import { Box, Button, Flex, HStack, Heading, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { DownloadIcon, TimeIcon } from '@chakra-ui/icons'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { HeroKpiStrip } from './HeroKpiStrip'
import { TvlOverviewChart } from './TvlOverviewChart'
import { TvlByChainBars } from './TvlByChainBars'
import { LiveSwapTape } from './LiveSwapTape'
import { PoolCompositionDonut } from './PoolCompositionDonut'
import { BoostedHighlight } from './BoostedHighlight'
import { ProtocolChangelog } from './ProtocolChangelog'
import { PoolExplorer } from './PoolExplorer'

export function ProtocolOverview() {
  return (
    <DefaultPageContainer pb="2xl" pt={['xl', '2xl']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        <FadeInOnView animateOnce={false}>
          <Flex
            align={{ base: 'flex-start', md: 'flex-end' }}
            direction={{ base: 'column', md: 'row' }}
            gap="md"
            justify="space-between"
          >
            <Box>
              <Heading
                pb="sm"
                size="h3"
                sx={{ textWrap: 'balance' }}
                variant="special"
              >
                Protocol overview
              </Heading>
              <Text maxW="540px" sx={{ textWrap: 'balance' }} variant="secondary">
                Aggregated metrics across Balancer v2 and v3, live from the Balancer API.
              </Text>
            </Box>
            <HStack spacing="sm">
              <Button leftIcon={<Icon as={DownloadIcon} />} size="sm" variant="tertiary">
                Export CSV
              </Button>
              <Button leftIcon={<Icon as={TimeIcon} />} size="sm" variant="primary">
                Snapshot 24h
              </Button>
            </HStack>
          </Flex>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <HeroKpiStrip />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="md">
            <Box gridColumn={{ lg: 'span 2' }}>
              <TvlOverviewChart />
            </Box>
            <TvlByChainBars />
          </SimpleGrid>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <PoolExplorer />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="md">
            <PoolCompositionDonut />
            <BoostedHighlight />
            <LiveSwapTape />
          </SimpleGrid>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <ProtocolChangelog />
        </FadeInOnView>
      </VStack>
    </DefaultPageContainer>
  )
}
