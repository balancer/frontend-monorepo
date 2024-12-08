/* eslint-disable max-len */
'use client'

import { VStack, Heading, Button, Text, GridItem, Grid, Box, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ArrowUpRight } from 'react-feather'
import { GraniteBg } from './shared/GraniteBg'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { BlurIn } from '@repo/lib/shared/components/animations/BlurIn'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'

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
      <DefaultPageContainer noVerticalPadding py={['3xl', '10rem']}>
        <VStack align="start" spacing="lg" w="full">
          <VStack align="start" w="full">
            <BlurIn delay={0.4}>
              <Text
                background="font.specialSecondary"
                backgroundClip="text"
                fontSize="sm"
                textTransform="uppercase"
              >
                BALANCER GRANTS
              </Text>
            </BlurIn>
            <WordsPullUp
              as="h2"
              color="font.primary"
              fontSize={{ base: '3xl', lg: '4xl' }}
              fontWeight="bold"
              lineHeight={1}
              text="Get help to innovate on v3"
            />
            <FadeIn delay={0.4} direction="up" w="full">
              <Text color="font.secondary" maxW="full" w="3xl">
                Balancer Community Grants aim to accelerate the development of the Balancer
                ecosystem. Grants for innovation on Balancer v3 will be prioritized. This program is
                managed by the Balancer Grants DAO, an independent community-owned grants program
                for the Balancer ecosystem.
              </Text>
            </FadeIn>
          </VStack>
          <Stack
            align={{ base: 'start', lg: 'end' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            w="full"
          >
            <FadeIn delay={0.5} direction="up">
              <Text fontSize={{ base: 'xl', lg: '2xl' }} opacity={0.8}>
                Some fund-worthy ideas to get you started
              </Text>
            </FadeIn>
            <Button
              as={NextLink}
              href="https://grants.balancer.community/"
              rightIcon={<ArrowUpRight />}
              variant="secondary"
            >
              Get a grant
            </Button>
          </Stack>
          <Grid
            gap="md"
            templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            w="full"
          >
            {grantIdeas.map(idea => (
              <GridItem key={idea.title}>
                <NextLink href="https://spearbit.com/" rel="noopener noreferrer" target="_blank">
                  <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="2xl">
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
