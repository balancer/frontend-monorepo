'use client'

import { Heading, VStack, Text, Grid, GridItem, Box } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from './shared/RadialPattern'
import { FeatureCard } from './Build'

export function Grow() {
  return (
    <Noise>
      <DefaultPageContainer>
        <VStack alignItems="center" spacing="md" textAlign="center">
          <Heading as="h3" size="xl">
            Grow with us.
          </Heading>
          <Text color="font.secondary" fontSize="2xl" maxW="2xl">
            Balancer v3 is DeFi infrastructure to be built on.
            <br />
            Our growth is your growth.
          </Text>
        </VStack>
        <Grid gap="md" mt="2xl" templateColumns="repeat(12, 1fr)" templateRows="repeat(3, 1fr)">
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{ innerSize: '100px', size: '200px' }}
              stat="$1.1B"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="TVL"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{ innerSize: '100px', size: '200px' }}
              stat="4K+"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="Pools"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem colSpan={4}>
            <FeatureCard
              radialPatternProps={{ innerSize: '100px', size: '200px' }}
              stat="$54M"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              title="24hr Volume"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P1
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P2
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P3
          </GridItem>
          <GridItem colSpan={6} rowSpan={2}>
            <FeatureCard
              h="full"
              radialPatternProps={{ innerSize: '100px', size: '250px' }}
              stat="10+"
              statProps={{ fontSize: '3xl', fontWeight: 'bold' }}
              subTitle="Instant volume for your liquidity."
              title="Aggregator Integrations"
              titleSize="3xl"
            />
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P5
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P6
          </GridItem>
          <GridItem border="1px solid red" colSpan={2}>
            P7
          </GridItem>
        </Grid>
        {/* <Grid gap="md" mt="2xl" templateColumns="repeat(4, 1fr)" textAlign="center" w="full">
          <GridItem minH="200px">
            <Box border="0px solid" position="relative">
              <RadialPattern
                borderColor="border.base"
                borderWidth="2px"
                circleCount={8}
                innerSize="100px"
                left="calc(50% - 100px)"
                position="absolute"
                size="200px"
                top="0"
              >
                <Heading as="h4" size="xl" w="auto">
                  $1.1B
                </Heading>
              </RadialPattern>
              <Box position="relative" pt="150px">
                <Text
                  color="font.secondary"
                  fontSize="2xl"
                  mx="auto"
                  px="md"
                  rounded="full"
                  w="fit-content"
                >
                  TVL
                </Text>
              </Box>
            </Box>
          </GridItem>
          <GridItem minH="200px">
            <Box border="0px solid" position="relative">
              <RadialPattern
                borderColor="border.base"
                borderWidth="2px"
                circleCount={8}
                innerSize="100px"
                left="calc(50% - 100px)"
                position="absolute"
                size="200px"
                top="0"
              >
                <Heading as="h4" size="xl" w="auto">
                  4K+
                </Heading>
              </RadialPattern>
              <Box position="relative" pt="150px">
                <Text
                  color="font.secondary"
                  fontSize="2xl"
                  mx="auto"
                  px="md"
                  rounded="full"
                  w="fit-content"
                >
                  Pools
                </Text>
              </Box>
            </Box>
          </GridItem>
          <GridItem minH="200px">
            <Box border="0px solid" position="relative">
              <RadialPattern
                borderColor="border.base"
                borderWidth="2px"
                circleCount={8}
                innerSize="100px"
                left="calc(50% - 100px)"
                position="absolute"
                size="200px"
                top="0"
              >
                <Heading as="h4" size="xl" w="auto">
                  $1.1B
                </Heading>
              </RadialPattern>
              <Box position="relative" pt="150px">
                <Text
                  color="font.secondary"
                  fontSize="2xl"
                  mx="auto"
                  px="md"
                  rounded="full"
                  w="fit-content"
                >
                  24hr Volume
                </Text>
              </Box>
            </Box>
          </GridItem>
          <GridItem minH="200px">
            <Box border="0px solid" position="relative">
              <RadialPattern
                borderColor="border.base"
                borderWidth="2px"
                circleCount={8}
                innerSize="100px"
                left="calc(50% - 100px)"
                position="absolute"
                size="200px"
                top="0"
              >
                <Heading as="h4" size="xl" w="auto">
                  10+
                </Heading>
              </RadialPattern>
              <Box position="relative" pt="150px">
                <Text
                  color="font.secondary"
                  fontSize="2xl"
                  mx="auto"
                  px="md"
                  rounded="full"
                  w="fit-content"
                >
                  Aggregator Integrations
                </Text>
              </Box>
            </Box>
          </GridItem>
        </Grid> */}
      </DefaultPageContainer>
    </Noise>
  )
}
