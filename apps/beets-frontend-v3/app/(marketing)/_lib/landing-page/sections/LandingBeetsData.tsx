'use client'

import React from 'react'
import {
  Box,
  BoxProps,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Progress,
  Text,
  VStack,
  chakra,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { BeetsByTheNumbers } from '../components/BeetsByTheNumbers'
const TOTAL_TVL = 144_000_000

type NetworkStats = {
  tvl: number
  volume24hr: number
  fees24hr: number
  sSonicBeetsTvl?: number
  maBeetsTvl?: number
  boostedPoolTvl?: number
  sFtmXLegacyTvl?: number
  maBeetsLegacyTvl?: number
}

type MockGqlChain = 'SONIC' | 'OPTIMISM' | 'FANTOM'

const MockNetworkData: Record<MockGqlChain, NetworkStats> = {
  SONIC: {
    tvl: 105_000_000,
    volume24hr: 10_000_000,
    fees24hr: 7_000,
    sSonicBeetsTvl: 37_600_000,
    maBeetsTvl: 50_560_000,
    boostedPoolTvl: 23_400_000,
  },
  OPTIMISM: {
    tvl: 40_097_000,
    volume24hr: 1_260_000,
    fees24hr: 1_250,
  },
  FANTOM: {
    tvl: 3_560_000,
    volume24hr: 1_700_000,
    fees24hr: 250,
    sFtmXLegacyTvl: 1_100_000,
    maBeetsLegacyTvl: 24_025,
  },
}

function SubStatBar({
  stat,
  label,
  color,
  ...rest
}: { stat: number; label: string; color: string } & BoxProps) {
  const { toCurrency } = useCurrency()
  return (
    <HStack justify="space-between" mt="sm" w="full" {...rest}>
      <HStack w="full">
        <Progress colorScheme={color} rounded="lg" value={100} w={`${(stat / TOTAL_TVL) * 100}%`} />
        <Text fontSize="xs">{label}</Text>
      </HStack>

      <Text fontSize="xs">{toCurrency(stat)}</Text>
    </HStack>
  )
}

function ChainStats({ chain }: { chain: MockGqlChain }) {
  const {
    tvl,
    sSonicBeetsTvl,
    maBeetsTvl,
    boostedPoolTvl,
    volume24hr,
    fees24hr,
    sFtmXLegacyTvl,
    maBeetsLegacyTvl,
  } = MockNetworkData[chain]
  const { toCurrency } = useCurrency()

  return (
    <Box bg="rgba(0, 0, 0, 0.2)" p="lg" w="full" height="360px" display="flex" flexDir="column">
      <HStack justify="space-between" mb="sm" w="full">
        <Text fontSize="2xl">TVL</Text>
        <Text fontSize="2xl">{toCurrency(tvl)}</Text>
      </HStack>
      <Progress colorScheme="cyan" rounded="lg" value={(tvl / TOTAL_TVL) * 100} w="full" />
      <Box flex="1">
        {sSonicBeetsTvl && <SubStatBar color="red" label="sSONICBeets" stat={sSonicBeetsTvl} />}
        {maBeetsTvl && <SubStatBar color="green" label="maBEETS" stat={maBeetsTvl} />}
        {boostedPoolTvl && <SubStatBar color="cyan" label="Boosted Pools" stat={boostedPoolTvl} />}
        {sFtmXLegacyTvl && (
          <SubStatBar color="orange" label="sFTMx (legacy)" stat={sFtmXLegacyTvl} />
        )}
        {maBeetsLegacyTvl && (
          <SubStatBar color="purple" label="maBEETS (legacy)" stat={maBeetsLegacyTvl} />
        )}
      </Box>

      <Grid gap="sm" templateColumns="repeat(2, 1fr)">
        <GridItem bg="rgba(255, 255, 255, 0.05)" p="lg" w="full">
          <VStack align="flex-start" spacing="sm">
            <Text fontSize="lg">24 Volume</Text>
            <Text fontSize="2xl">{toCurrency(volume24hr)}</Text>
          </VStack>
        </GridItem>
        <GridItem bg="rgba(255, 255, 255, 0.05)" p="lg" w="full">
          <VStack align="flex-start" spacing="sm">
            <Text fontSize="lg">24 Fees</Text>
            <Text fontSize="2xl">{toCurrency(fees24hr)}</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  )
}

function ChainDataCard({ chain, networkColor }: { chain: MockGqlChain; networkColor: string }) {
  return (
    <Box p="xl">
      <Box mb="lg">
        <Heading fontSize="3xl">
          Beets on{' '}
          <chakra.span color={networkColor} transform="capitalize">
            {chain}
          </chakra.span>
        </Heading>
      </Box>
      <ChainStats chain={chain} />
    </Box>
  )
}

function GlobalStatsCard({ label, value }: { label: string; value: string }) {
  return (
    <Flex alignItems="flex-end" mx="md" my="sm">
      <Box flex="1" textAlign="left" color="font.highlight" fontWeight="semibold">
        {label}
      </Box>
      <Box>
        <Text fontSize="4xl">{value}</Text>
      </Box>
    </Flex>
  )
}

export function LandingBeetsData() {
  return (
    <DefaultPageContainer noVerticalPadding py="3xl">
      <VStack spacing="lg">
        <Box bg="rgba(0, 0, 0, 0.1)" display="flex" w="full">
          <Grid
            gap="sm"
            templateColumns={{
              base: '1fr',
              lg: '1fr',
              xl: '1.25fr 1fr 1fr 1fr',
            }}
            w="full"
            px="lg"
            py="lg"
          >
            <GridItem display="flex" alignItems="center">
              <BeetsByTheNumbers />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard label="TVL" value="$165.56m" />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard label="24 VOL" value="$80.12m" />
            </GridItem>
            <GridItem bg="rgba(0, 0, 0, 0.2)">
              <GlobalStatsCard label="24h FEES" value="$72.5k" />
            </GridItem>
          </Grid>
        </Box>
        <Grid gap="none" templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} w="full">
          <GridItem bg="rgba(255, 255, 255, 0.05)">
            <ChainDataCard chain="SONIC" networkColor="orange" />
          </GridItem>
          <GridItem bg="rgba(0, 0, 0, 0.05)">
            <ChainDataCard chain="OPTIMISM" networkColor="red" />
          </GridItem>
          <GridItem bg="rgba(0, 0, 0, 0.2)">
            <ChainDataCard chain="FANTOM" networkColor="deepskyblue" />
          </GridItem>
        </Grid>
      </VStack>
    </DefaultPageContainer>
  )
}
