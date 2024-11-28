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
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    title: 'Custom AMM',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    title: 'Custom pool',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    title: 'Pool hook',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    title: 'Custom AMM',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    title: 'Custom pool',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
            <Heading>Get help to innovate on v3 Get a grant</Heading>
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
