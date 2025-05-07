'use client'

import { VStack, Button, Heading, Text, GridItem, Grid, Box, Stack } from '@chakra-ui/react'
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
    <Noise backgroundColor="background.level0WithOpacity" position="relative">
      <DefaultPageContainer noVerticalPadding py={['3xl', '10rem']}>
        <VStack align="start" spacing="lg" w="full">
          <VStack align="start" spacing="lg" w="full">
            <BlurIn delay={0.4}>
              <Text
                background="font.specialSecondary"
                backgroundClip="text"
                fontSize="sm"
                variant="eyebrow"
              >
                BALANCER GRANTS
              </Text>
            </BlurIn>
            <WordsPullUp
              as="h2"
              color="font.primary"
              fontSize={{ base: '2xl', lg: '4xl' }}
              fontWeight="bold"
              letterSpacing="-0.04rem"
              lineHeight={1}
              pr={{ base: 'xxs', lg: '0.9' }}
              text="Innovate with us"
            />
            <FadeIn delay={0.2} direction="up" duration={0.6} w="full">
              <Text color="font.secondary" fontSize="lg" maxW="full" w="3xl">
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
            <FadeIn delay={0.5} direction="up" duration={0.6}>
              <Text fontSize={{ base: 'lg', lg: '2xl' }} fontWeight="bold" opacity={0.8}>
                Some fund-worthy ideas to get you started
              </Text>
            </FadeIn>
            <Button
              as={NextLink}
              href="https://grants.balancer.community/"
              rightIcon={<ArrowUpRight size="16px" />}
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
                <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="2xl">
                  <GraniteBg />
                  <VStack align="start" p="md" position="relative">
                    <Heading fontSize="lg" variant="h6">
                      {idea.title}
                    </Heading>
                    <Text color="font.secondary">{idea.description}</Text>
                  </VStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </DefaultPageContainer>

      <Box
        bgGradient="linear(transparent 0%, background.base 50%, transparent 100%)"
        bottom="0"
        h="200px"
        left="0"
        mb="-100px"
        position="absolute"
        w="full"
      />
    </Noise>
  )
}
