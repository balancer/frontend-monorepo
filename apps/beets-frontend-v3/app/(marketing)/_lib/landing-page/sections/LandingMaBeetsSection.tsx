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

export function LandingMaBeetsSection() {
  const { toCurrency } = useCurrency()

  return (
    <>
      <Center textAlign="center" pb="2xl">
        <VStack>
          <Heading fontSize="5xl">maBEETS</Heading>
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo.
          </Text>
        </VStack>
      </Center>
      <DefaultPageContainer noVerticalPadding pb="3xl">
        <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
          <Box display="flex" mb="xl">
            <Box flex={1} mr="md">
              <FeatureCard
                title="Maturity vs Locking"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo."
              />
            </Box>
            <Box flex={1} ml="md">
              <FeatureCard
                title="Fairer Rewards"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo."
              />
            </Box>
          </Box>
          <Box mb="lg">
            <Center>
              <Heading fontSize="3xl">How it works</Heading>
            </Center>
          </Box>
          <Box display="flex">
            <Box flex="1">
              <Box height="100px" bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" mb="lg" />
              <Heading fontSize="xl">Deposit & receive fBEETS</Heading>
              <Text fontWeight="thin" fontSize="lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                ultrices dapibus.
              </Text>
            </Box>
            <Box flex="1" mx="lg">
              <Box height="100px" bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" mb="lg" />
              <Heading fontSize="xl">Deposit fBEETS</Heading>
              <Text fontWeight="thin" fontSize="lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                ultrices dapibus.
              </Text>
            </Box>
            <Box flex="1">
              <Box height="100px" bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" mb="lg" />
              <Heading fontSize="xl">Receive maBEETS relic</Heading>
              <Text fontWeight="thin" fontSize="lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                ultrices dapibus.
              </Text>
            </Box>
          </Box>
        </Box>
      </DefaultPageContainer>
    </>
  )
}
