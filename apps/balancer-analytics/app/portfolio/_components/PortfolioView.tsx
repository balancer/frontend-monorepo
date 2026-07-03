'use client'

import { Box, Card, Grid, GridItem, Skeleton, Text, VStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { usePortfolioByAddress } from '@analytics/lib/hooks/usePortfolioByAddress'
import { PortfolioKpiStrip } from './PortfolioKpiStrip'
import { PortfolioTokenDonut } from './PortfolioTokenDonut'
import { PortfolioTvlByChainBars } from './PortfolioTvlByChainBars'
import { PortfolioMerklCard } from './PortfolioMerklCard'
import { PortfolioPositionsTable } from './PortfolioPositionsTable'

export function PortfolioView({ address }: { address: string }) {
  const portfolio = usePortfolioByAddress(address)

  if (portfolio.error) {
    return (
      <Card variant="level1">
        <Text color="red.300">Failed to load portfolio: {portfolio.error.message}</Text>
      </Card>
    )
  }

  if (portfolio.loading && portfolio.positions.length === 0) {
    return (
      <VStack align="stretch" spacing="md">
        <Skeleton h="120px" rounded="lg" />
        <Grid gap="md" templateColumns={{ base: '1fr', lg: '1.2fr 1fr 1fr' }}>
          <Skeleton h="280px" rounded="lg" />
          <Skeleton h="280px" rounded="lg" />
          <Skeleton h="280px" rounded="lg" />
        </Grid>
        <Skeleton h="400px" rounded="lg" />
      </VStack>
    )
  }

  // No positions returned — empty-state copy is friendlier than rendering a
  // grid of $0 cards. Address validity itself was enforced by the route.
  if (portfolio.positions.length === 0) {
    return (
      <Card p="lg" variant="level1">
        <VStack align="flex-start" spacing="xs">
          <Text color="font.maxContrast" fontSize="lg" fontWeight="bold">
            No Balancer positions found
          </Text>
          <Text color="font.secondary" fontSize="sm" maxW="560px">
            This wallet doesn’t currently hold BPT or staked positions on any of the supported
            Balancer chains. The address might still have past activity — check pool events on
            the pool detail pages.
          </Text>
        </VStack>
      </Card>
    )
  }

  return (
    <VStack align="stretch" spacing="lg">
      <FadeInOnView animateOnce={false}>
        <PortfolioKpiStrip
          address={address}
          summary={portfolio.summary}
          tokens={portfolio.tokens}
        />
      </FadeInOnView>

      <FadeInOnView animateOnce={false}>
        <Grid
          gap="md"
          templateColumns={{ base: '1fr', lg: '1.2fr 1fr 1fr' }}
        >
          <GridItem minW={0}>
            <PortfolioTokenDonut tokens={portfolio.tokens} />
          </GridItem>
          <GridItem minW={0}>
            <PortfolioTvlByChainBars chains={portfolio.chains} totalUsd={portfolio.summary.totalUsd} />
          </GridItem>
          <GridItem minW={0}>
            <PortfolioMerklCard address={address} />
          </GridItem>
        </Grid>
      </FadeInOnView>

      <FadeInOnView animateOnce={false}>
        <Box id="positions" scrollMarginTop="96px">
          <PortfolioPositionsTable positions={portfolio.positions} />
        </Box>
      </FadeInOnView>
    </VStack>
  )
}
