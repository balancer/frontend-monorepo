/* eslint-disable max-len */
'use client'

import { VStack, HStack, Heading, Button, Text, GridItem, Grid, Box } from '@chakra-ui/react'
import NextLink from 'next/link'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ArrowUpRight } from 'react-feather'
import { GraniteBg } from './shared/GraniteBg'

const grantIdeas = [
  {
    title: 'Pool hook',
    description:
      'Hooks enable limitless pool customization possibilities in v3. We actively fund innovative products that solve real problems or create new value. Pool creators can earn additional revenue through customizable fees.',
  },
  {
    title: 'Custom AMM',
    description:
      'Balancer is the home for AMM innovation and development is now easier than ever on v3. We are looking to fund innovative ideas to solve LVR, recapture MEV and other ways to bring more value to LPs.',
  },
  {
    title: 'Custom pool',
    description:
      'Build your custom pool easily on Balancer v3 and follow in the footsteps of Gyroscope and Xave Finance. Get a grant to kickstart your project using custom invariants to create the next innovation in DeFi.',
  },
]

export function Grants() {
  return (
    <Noise backgroundColor="background.level0WithOpacity ">
      <DefaultPageContainer>
        <VStack align="start" spacing="lg" w="full">
          <VStack align="start">
            <Text
              background="font.specialSecondary"
              backgroundClip="text"
              fontSize="sm"
              textTransform="uppercase"
            >
              BALANCER GRANTS
            </Text>
            <Heading>Get help to innovate on v3</Heading>
            <Text color="font.secondary" maxW="3xl">
              Balancer Community Grants aim to accelerate the development of the Balancer ecosystem.
              Grants for innovation on Balancer v3 will be prioritized. This program is managed by
              the Balancer Grants DAO, an independent community-owned grants program for the
              Balancer ecosystem.
            </Text>
          </VStack>
          <HStack align="end" justify="space-between" w="full">
            <Text fontSize="2xl">Some fund-worthy ideas to get you started</Text>
            <Button
              as={NextLink}
              href="https://grants.balancer.community/"
              rightIcon={<ArrowUpRight />}
              variant="secondary"
            >
              Get a grant
            </Button>
          </HStack>
          <Grid gap="md" templateColumns="repeat(3, 1fr)" w="full">
            {grantIdeas.map(idea => (
              <GridItem key={idea.title}>
                <NextLink href="https://spearbit.com/" rel="noopener noreferrer" target="_blank">
                  <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="lg">
                    <GraniteBg />
                    <VStack align="start" p="md" position="relative">
                      <Text fontSize="lg">{idea.title}</Text>
                      <Text color="font.secondary">{idea.description}</Text>
                    </VStack>
                  </Box>
                </NextLink>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </DefaultPageContainer>
    </Noise>
  )
}
