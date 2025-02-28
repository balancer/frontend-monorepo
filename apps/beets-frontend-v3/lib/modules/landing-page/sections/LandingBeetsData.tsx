'use client'

import React from 'react'
import {
  Box,
  //BoxProps,
  Button,
  Center,
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
import {
  GetProtocolStatsPerChainQuery,
  GetProtocolStatsQuery,
  GetStakedSonicDataQuery,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
//import { fNum } from '@repo/lib/shared/utils/numbers'
import { bn } from '@repo/lib/shared/utils/numbers'
import NextLink from 'next/link'

// function SubStatBar({
//   stat,
//   label,
//   color,
//   totalTvl,
//   ...rest
// }: { stat: number; label: string; color: string; totalTvl: string } & BoxProps) {
//   const { toCurrency } = useCurrency()
//   return (
//     <HStack justify="space-between" mt="sm" w="full" {...rest}>
//       <HStack w="full">
//         <Progress
//           colorScheme={color}
//           rounded="lg"
//           value={100}
//           // w={fNum('percentage', bn(stat).div(bn(totalTvl)).toString())}
//         />
//         <Text fontSize="xs">{label}</Text>
//       </HStack>

//       <Text fontSize="xs">{toCurrency(stat)}</Text>
//     </HStack>
//   )
// }

function ChainStats({
  isSonic,
  protocolData,
  stakedSonicData,
  totalTvl,
}: {
  isSonic?: boolean
  protocolData: GetProtocolStatsPerChainQuery
  stakedSonicData: GetStakedSonicDataQuery
  totalTvl: string
}) {
  const { toCurrency } = useCurrency()

  let totalFees = bn(protocolData.protocolMetricsChain.swapFee24h)
    .plus(protocolData.protocolMetricsChain.yieldCapture24h)
    .toString()

  if (isSonic) {
    totalFees = bn(totalFees)
      .plus(stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h)
      .toString()
  }

  return (
    <Box bg="rgba(0, 0, 0, 0.2)" display="flex" flexDir="column" height="300px" p="lg" w="full">
      <HStack justify="space-between" mb="sm" w="full">
        <Text fontSize="2xl">TVL</Text>
        <Text fontSize="2xl">{toCurrency(protocolData.protocolMetricsChain.totalLiquidity)}</Text>
      </HStack>
      <Progress
        colorScheme="cyan"
        rounded="lg"
        value={bn(protocolData.protocolMetricsChain.totalLiquidity)
          .div(totalTvl)
          .times(100)
          .toNumber()}
        w="full"
      />
      <Box flex="1">
        {/*sSonicBeetsTvl && <SubStatBar color="red" label="sSONICBeets" stat={sSonicBeetsTvl} />}
        {maBeetsTvl && <SubStatBar color="green" label="maBEETS" stat={maBeetsTvl} />}
        {boostedPoolTvl && <SubStatBar color="cyan" label="Boosted Pools" stat={boostedPoolTvl} />}
        {sFtmXLegacyTvl && (
          <SubStatBar color="orange" label="sFTMx (legacy)" stat={sFtmXLegacyTvl} />
        )}
        {maBeetsLegacyTvl && (
          <SubStatBar color="purple" label="maBEETS (legacy)" stat={maBeetsLegacyTvl} />
        )*/}
      </Box>

      <Grid gap="sm" templateColumns="repeat(2, 1fr)">
        <GridItem bg="rgba(255, 255, 255, 0.05)" p="lg" w="full">
          <VStack align="flex-start" spacing="sm">
            <Text fontSize="lg">24h Volume</Text>
            <Text fontSize="2xl">
              {toCurrency(protocolData.protocolMetricsChain.swapVolume24h)}
            </Text>
          </VStack>
        </GridItem>
        <GridItem bg="rgba(255, 255, 255, 0.05)" p="lg" w="full">
          <VStack align="flex-start" spacing="sm">
            <Text fontSize="lg">24h Fees</Text>
            <Text fontSize="2xl">{toCurrency(totalFees)}</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  )
}

function ChainDataCard({
  chain,
  networkColor,
  protocolData,
  totalTvl,
  button,
  isSonic,
  stakedSonicData,
}: {
  chain: GqlChain
  networkColor: string
  protocolData: GetProtocolStatsPerChainQuery
  totalTvl: string
  button: React.ReactNode
  isSonic?: boolean
  stakedSonicData: GetStakedSonicDataQuery
}) {
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
      <ChainStats
        isSonic={isSonic}
        protocolData={protocolData}
        stakedSonicData={stakedSonicData}
        totalTvl={totalTvl}
      />
      <Center mt="xl">{button}</Center>
    </Box>
  )
}

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
  protocolDataPerChain,
  stakedSonicData,
}: {
  protocolData: GetProtocolStatsQuery
  protocolDataPerChain: GetProtocolStatsPerChainQuery[]
  stakedSonicData: GetStakedSonicDataQuery
}) {
  const { toCurrency } = useCurrency()

  const chainData: Record<string, GetProtocolStatsPerChainQuery> = protocolDataPerChain.reduce(
    (acc, item) => {
      acc[item.protocolMetricsChain.chainId] = item
      return acc
    },
    {} as Record<string, GetProtocolStatsPerChainQuery>
  )

  const protocolMetricsAggregated = protocolData.protocolMetricsAggregated
  const totalTvl = protocolMetricsAggregated.totalLiquidity

  const totalFees = bn(stakedSonicData.stsGetGqlStakedSonicData.rewardsClaimed24h)
    .plus(protocolMetricsAggregated.swapFee24h)
    .plus(protocolMetricsAggregated.yieldCapture24h)
    .toString()

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
        <Grid gap="none" templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} w="full">
          <GridItem bg="rgba(255, 255, 255, 0.05)">
            <ChainDataCard
              button={
                <Button as={NextLink} href="/pools?networks=SONIC" variant="primary">
                  Sonic Pools
                </Button>
              }
              chain={GqlChain.Sonic}
              isSonic
              networkColor="orange"
              protocolData={chainData[getChainId(GqlChain.Sonic)]}
              stakedSonicData={stakedSonicData}
              totalTvl={totalTvl}
            />
          </GridItem>
          <GridItem bg="rgba(0, 0, 0, 0.05)">
            <ChainDataCard
              button={
                <Button as={NextLink} href="/pools?networks=OPTIMISM" variant="primary">
                  Optimism Pools
                </Button>
              }
              chain={GqlChain.Optimism}
              networkColor="red"
              protocolData={chainData[getChainId(GqlChain.Optimism)]}
              stakedSonicData={stakedSonicData}
              totalTvl={totalTvl}
            />
          </GridItem>
          <GridItem bg="rgba(0, 0, 0, 0.2)">
            <ChainDataCard
              button={
                <Button
                  as={NextLink}
                  href="https://ftm.beets.fi/pools"
                  target="_blank"
                  variant="primary"
                >
                  Fantom Pools
                </Button>
              }
              chain={GqlChain.Fantom}
              networkColor="deepskyblue"
              protocolData={chainData[getChainId(GqlChain.Fantom)]}
              stakedSonicData={stakedSonicData}
              totalTvl={totalTvl}
            />
          </GridItem>
        </Grid>
      </VStack>
    </DefaultPageContainer>
  )
}
