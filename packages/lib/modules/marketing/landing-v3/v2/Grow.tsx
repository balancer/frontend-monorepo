'use client'

import { Heading, VStack, Text, Grid, GridItem, Box } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from './shared/RadialPattern'

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
        <Grid gap="md" mt="2xl" templateColumns="repeat(4, 1fr)" textAlign="center" w="full">
          <GridItem minH="200px">
            <Box position="relative">
              <RadialPattern
                borderColor="border.base"
                borderWidth="1px"
                circleCount={8}
                innerSize="100px"
                left="50px"
                position="absolute"
                size="200px"
                top="0"
              >
                <Heading as="h4" size="xl" w="auto">
                  $1.1B
                </Heading>
              </RadialPattern>
            </Box>
            <Text color="font.secondary">TVL</Text>
          </GridItem>
          <GridItem>
            <Heading as="h4" size="xl" w="auto">
              4K+
            </Heading>
            <Text color="font.secondary">Pools</Text>
          </GridItem>
          <GridItem>
            <Heading as="h4" size="xl" w="auto">
              $100M
            </Heading>
            <Text color="font.secondary">24h Volume</Text>
          </GridItem>
          <GridItem>
            <Heading as="h4" size="xl" w="auto">
              10+
            </Heading>
            <Text color="font.secondary">Aggregator integrations</Text>
          </GridItem>
        </Grid>
      </DefaultPageContainer>
    </Noise>
  )
}
