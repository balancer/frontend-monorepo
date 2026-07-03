'use client'

import { Box, Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { HeroKpiStrip } from './HeroKpiStrip'
import { ProtocolHighlights } from './ProtocolHighlights'
import { TvlOverviewChart } from './TvlOverviewChart'
import { TvlByChainBars } from './TvlByChainBars'
import { BiggestSwaps } from './BiggestSwaps'
import { PoolCompositionDonut } from './PoolCompositionDonut'
import { PoolExplorer } from './PoolExplorer'

export function ProtocolOverview() {
  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        <FadeInOnView animateOnce={false}>
          <Box id="overview" scrollMarginTop="96px">
            <Heading pb="sm" size="h3" sx={{ textWrap: 'balance' }} variant="special">
              Balancer Analytics
            </Heading>
            <Text maxW="540px" sx={{ textWrap: 'balance' }} variant="secondary">
              Live protocol metrics across Balancer v2, v3 and CoW AMM.
            </Text>
          </Box>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <HeroKpiStrip />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <Box id="liquidity" scrollMarginTop="96px">
            <TvlOverviewChart />
          </Box>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <ProtocolHighlights />
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <Grid
            gap="md"
            templateColumns={{ base: '1fr', lg: '1fr 1fr 1.4fr' }}
          >
            <GridItem minW={0}>
              <TvlByChainBars />
            </GridItem>
            <GridItem minW={0}>
              <PoolCompositionDonut />
            </GridItem>
            <GridItem minW={0}>
              <BiggestSwaps />
            </GridItem>
          </Grid>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <Box id="pools" scrollMarginTop="96px">
            <PoolExplorer />
          </Box>
        </FadeInOnView>

        {/* Governance moved to its own page (`/governance`) so it can
            grow widgets — naked-BAL distribution, veBAL stats, etc. The
            navbar link points there directly. */}
      </VStack>
    </DefaultPageContainer>
  )
}
