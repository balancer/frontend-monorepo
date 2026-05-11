'use client'

import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { HeroKpiStrip } from './HeroKpiStrip'
import { TvlOverviewChart } from './TvlOverviewChart'
import { TvlByChainBars } from './TvlByChainBars'
import { LiveSwapTape } from './LiveSwapTape'
import { PoolCompositionDonut } from './PoolCompositionDonut'
import { ProtocolChangelog } from './ProtocolChangelog'
import { PoolExplorer } from './PoolExplorer'

export function ProtocolOverview() {
  return (
    // `noVerticalPadding` strips the 72px navbar-clearance pad on the outer
    // Box (we render our own navbar), then we add a tight `pt` ourselves.
    <DefaultPageContainer noVerticalPadding pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        <FadeInOnView animateOnce={false}>
          <Box>
            <Heading pb="sm" size="h3" sx={{ textWrap: 'balance' }} variant="special">
              Balancer Analytics
            </Heading>
            <Text maxW="540px" sx={{ textWrap: 'balance' }} variant="secondary">
              Aggregated metrics across Balancer v2 and v3, live from the Balancer API.
            </Text>
          </Box>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <HeroKpiStrip />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <TvlOverviewChart />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="md">
            <TvlByChainBars />
            <PoolCompositionDonut />
            <LiveSwapTape />
          </SimpleGrid>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <PoolExplorer />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <ProtocolChangelog />
        </FadeInOnView>
      </VStack>
    </DefaultPageContainer>
  )
}
