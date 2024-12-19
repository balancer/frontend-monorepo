'use client'

import React from 'react'
import { Box, Center, Grid, GridItem, Heading, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { CoingeckoIcon } from '@repo/lib/shared/components/icons/CoingeckoIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <HStack align="start" h="full" spacing="none" w="full">
      <Box bg="rgba(0, 0, 0, 0.1)" borderBottom="30px solid rgba(0, 0, 0, 0.4)" h="full" w="40%" />
      <VStack align="start" borderBottom="30px solid rgba(0, 0, 0, 0.3)" h="full" p="lg" w="60%">
        <Heading fontSize="2xl">{title}</Heading>
        <Text fontSize="lg">{description}</Text>
      </VStack>
    </HStack>
  )
}

export function Token() {
  const { toCurrency } = useCurrency()

  return (
    <>
      <Center mb="xl" textAlign="center">
        <VStack>
          <Heading fontSize="5xl">The $BEETS token</Heading>
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl">
            The $BEETS token is our primary method of incentive and reward. But it's so much more.
          </Text>
        </VStack>
      </Center>
      <DefaultPageContainer noVerticalPadding pb="3xl">
        <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
          <Grid
            gap="xl"
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            templateRows={{ base: 'repeat(4, 1fr)', lg: 'repeat(2, 1fr)' }}
          >
            <GridItem>
              <FeatureCard
                description="$BEETS is a key instrument in many incentivized pools as well as 'bribe' rewards and other partner offers."
                title="Rewards"
              />
            </GridItem>
            <GridItem>
              <FeatureCard
                description="Vest $BEETS in the maBEETS initiative to get voting power in our DAO based governance model."
                title="Vote"
              />
            </GridItem>
            <GridItem>
              <FeatureCard
                description="$BEETS is bridgeable between Optimism and Fantom - and more importantly for existing holders on FTM, easily migratable to Sonic."
                title="Bridge & Migrate"
              />
            </GridItem>
            <GridItem>
              <Center h="full" w="full">
                <VStack>
                  <Heading size="lg">$BEETS Price</Heading>
                  <Text fontSize="3xl">{toCurrency(0.0303)}</Text>
                  <HStack>
                    <Link href="https://www.coingecko.com/en/coins/beethoven-x" isExternal>
                      View price history
                    </Link>
                    <CoingeckoIcon height={16} width={16} />
                  </HStack>
                </VStack>
              </Center>
            </GridItem>
          </Grid>
        </Box>
      </DefaultPageContainer>
    </>
  )
}
