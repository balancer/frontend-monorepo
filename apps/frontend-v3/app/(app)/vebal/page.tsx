'use client'
import { Heading, Button, Stack, Box, Text, Flex } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'

import Noise from '@repo/lib/shared/components/layout/Noise'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

import NextLink from 'next/link'
import { RadialPattern } from '@/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
import { Picture } from '@repo/lib/shared/components/other/Picture'

export default function VeBALPage() {
  return (
    <>
      <Box
        borderBottom="1px solid"
        borderColor="border.base"
        h="720px"
        left="50%"
        marginLeft="-50vw" // Negative half viewport width
        marginRight="-50vw" // Negative half viewport width
        maxWidth="100vw" // Ensure it doesn't exceed viewport width
        position="relative"
        right="50%"
        width="100vw" // Full viewport width
      >
        <Noise
          backgroundColor="background.level0WithOpacity"
          h="100%"
          overflow="hidden"
          position="relative"
          shadow="innerBase"
        >
          <DefaultPageContainer
            h="100%"
            pb={['xl', 'xl', '10']}
            position="relative"
            pt={['xl', '40px']}
          >
            <RadialPattern
              circleCount={20}
              height={2000}
              innerHeight={150}
              innerWidth={150}
              left="calc(50% - 300px)"
              position="absolute"
              top="-300px"
              width={2000}
            />

            <FadeInOnView animateOnce={false}>
              <Stack gap="md" maxWidth={400}>
                <Heading as="h2" size="lg" variant="special">
                  Lock-in for veBAL boosts
                </Heading>
                <Text color="font.secondary" mb="sm">
                  veBAL is the Balancer protocol governance system that rewards long-term
                  commitment. Get veBAL by locking the LP tokens of the BAL/WETH 80/20 pool. The
                  longer you lock, the more veBAL you get.
                </Text>
                <Flex gap="md" maxWidth={320}>
                  <Button as={NextLink} flex={1} href="/vebal/manage" size="lg" variant="primary">
                    Manage veBAL
                  </Button>

                  <Button as={NextLink} flex={1} href="/vebal/vote" size="lg" variant="tertiary">
                    Vote on gauges
                  </Button>
                </Flex>
              </Stack>

              <Box position="relative">
                <Box position="absolute">
                  <Picture
                    altText="veBAL token"
                    defaultImgType="png"
                    directory="/images/vebal/"
                    imgAvif
                    imgName="vebal"
                    imgPng
                  />
                </Box>
              </Box>
            </FadeInOnView>
          </DefaultPageContainer>
        </Noise>
      </Box>

      <Section>
        <Stack gap="lg" maxW="200px">
          <Heading as="h2" size="lg" variant="special">
            veBAL xxx
          </Heading>
          <Button as={NextLink} href="/vebal/manage" size="lg" variant="primary">
            Manage veBAL
          </Button>

          <Button as={NextLink} href="/vebal/vote" size="lg" variant="primary">
            Vote
          </Button>
        </Stack>
      </Section>
      <Section>
        <Heading as="h2" size="lg" variant="special" />
      </Section>
      <Section>
        <Heading as="h2" size="lg" variant="special">
          How it works
        </Heading>
      </Section>
    </>
  )
}
