'use client'

import React from 'react'
import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { BeetsByTheNumbers } from '../components/BeetsByTheNumbers'
import {
  GetProtocolStatsQuery,
  GetStakedSonicDataQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import { bn, isValidNumber } from '@repo/lib/shared/utils/numbers'

function GlobalStatsCard({ label, value }: { label: string; value: string }) {
  return (
    <Flex alignItems="flex-end" mx="md" my="sm">
      <Box color="font.highlight" flex="1" fontWeight="semibold" textAlign="left">
        {label}
      </Box>
      <Box>
        <Text fontSize="4xl">{value}</Text>
      </Box>
    </Flex>
  )
}

export function LandingBeetsData({
  protocolData,
  stakedSonicData,
}: {
  protocolData: GetProtocolStatsQuery
  stakedSonicData: GetStakedSonicDataQuery
}) {
  const { toCurrency } = useCurrency()

  const protocolMetricsAggregated = protocolData.protocolMetricsAggregated

  const totalFees =
    isValidNumber(stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h) &&
    isValidNumber(protocolMetricsAggregated.swapFee24h) &&
    isValidNumber(protocolMetricsAggregated.yieldCapture24h)
      ? bn(stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h)
          .plus(protocolMetricsAggregated.swapFee24h)
          .plus(protocolMetricsAggregated.yieldCapture24h)
          .toString()
      : '0'

  return (
    <DefaultPageContainer noVerticalPadding position="relative" py="3xl">
      <VStack spacing="lg">
        <Box bg="rgba(0, 0, 0, 0.1)" display="flex" w="full">
          <Grid
            gap="sm"
            px="lg"
            py="lg"
            templateColumns={{
              base: '1fr',
              lg: '1fr',
              xl: '1.25fr 1fr 1fr 1fr',
            }}
            w="full"
          >
            <GridItem alignItems="center" display="flex">
              <BeetsByTheNumbers />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard
                label="TVL"
                value={toCurrency(protocolMetricsAggregated.totalLiquidity)}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard
                label="24h Volume"
                value={toCurrency(protocolMetricsAggregated.swapVolume24h)}
              />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard label="24h Fees" value={toCurrency(totalFees)} />
            </GridItem>
          </Grid>
        </Box>
      </VStack>
    </DefaultPageContainer>
  )
}
