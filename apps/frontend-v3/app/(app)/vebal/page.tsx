'use client'
import {
  Heading,
  Button,
  Stack,
  Box,
  Text,
  Flex,
  Center,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'

import Noise from '@repo/lib/shared/components/layout/Noise'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

import NextLink from 'next/link'
import { RadialPattern } from '@/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { WhyVeBalSection } from './components/WhyVeBalSection'
import { VebalStepCard } from './VebalStepCard'

export default function VeBALPage() {
  return (
    <>
      <Box
        borderBottom="1px solid"
        borderColor="border.base"
        left="50%"
        marginLeft="-50vw"
        marginRight="-50vw"
        maxWidth="100vw"
        position="relative"
        right="50%"
        width="100vw"
      >
        <Noise
          backgroundColor="background.level0WithOpacity"
          h="100%"
          overflow="hidden"
          position="relative"
          shadow="innerBase"
        >
          <DefaultPageContainer
            h={{ base: '500px', md: '800px' }}
            pb={['xl', 'xl', '10']}
            position="relative"
            pt={['xl', '40px']}
          >
            <RadialPattern
              circleCount={20}
              height={2000}
              innerHeight={150}
              innerWidth={150}
              left="calc(50% - 580px)"
              position="absolute"
              top="-480px"
              width={2000}
            />

            <Grid
              gap={{ base: '0', md: '4' }}
              h="100%"
              templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            >
              {/* Content Column */}
              <GridItem minW="400px">
                <FadeInOnView animateOnce={false}>
                  <Stack
                    alignItems={{ base: 'center', md: 'start' }}
                    gap="md"
                    justifyContent="center"
                    margin={{ base: '0 auto', md: '0' }}
                    maxWidth={{ base: 400, md: 'full' }}
                    position="relative"
                    top={{ base: '0', md: '200px' }}
                  >
                    <Stack alignItems={{ base: 'center', md: 'start' }}>
                      <Heading
                        as="h2"
                        backgroundClip="text"
                        bg="background.gold"
                        pb="0.5"
                        size="lg"
                      >
                        Lock-in for veBAL boosts
                      </Heading>
                      <Text color="font.secondary" mb="sm" sx={{ textWrap: 'pretty' }}>
                        veBAL is the Balancer protocol governance system that rewards long-term
                        commitment. Get veBAL by locking the LP tokens of the BAL/WETH 80/20 pool.
                      </Text>
                    </Stack>

                    <Flex gap="ms" maxWidth={320}>
                      <Button as={NextLink} flex={1} href="/vebal/manage" size="lg" variant="gold">
                        Manage veBAL
                      </Button>

                      <Box bg="background.level1">
                        <Button
                          as={NextLink}
                          bg="background.gold"
                          bgClip="text"
                          flex={1}
                          href="/vebal/vote"
                          size="lg"
                          variant="tertiary"
                        >
                          Vote on gauges
                        </Button>
                      </Box>
                    </Flex>
                  </Stack>
                </FadeInOnView>
              </GridItem>

              <GridItem display="flex" justifyContent={{ base: 'center', md: 'flex-start' }}>
                <FadeInOnView animateOnce={false}>
                  <Box
                    margin={{ base: '32px auto', md: '0' }}
                    width={{ base: '98%', md: 'clamp(800px, 85vw, 1200px)' }}
                  >
                    <Picture
                      altText="veBAL token"
                      defaultImgType="png"
                      directory="/images/vebal/"
                      imgAvif
                      imgName="vebal"
                      imgPng
                    />
                  </Box>
                </FadeInOnView>
              </GridItem>
            </Grid>
          </DefaultPageContainer>
        </Noise>
      </Box>
      <Section mt="40">
        <WhyVeBalSection />
      </Section>
      <Section>
        <Stack alignItems="center" gap="md" px="md">
          <FadeInOnView animateOnce={false}>
            <Stack alignItems="center" gap="md" px="md">
              <Heading as="h2" backgroundClip="text" bg="background.gold" pb="0.5" size="lg">
                Here’s how it works
              </Heading>
              <Text color="font.secondary" maxWidth="38ch" pt="0" textAlign="center">
                Add liquidity to the ve8020 BAL/WETH pool and lock it up. The longer you lock, the
                more veBAL you get.
              </Text>
            </Stack>
          </FadeInOnView>
          <Grid
            alignItems="stretch"
            gap="lg"
            maxW="container.xl"
            pt="lg"
            templateColumns={['1fr', '1fr', 'repeat(3, 1fr)']}
          >
            <GridItem display="flex" height="100%">
              <FadeInOnView animateOnce={false}>
                <VebalStepCard
                  altText="veBAL token"
                  description={
                    <>Join ve8020 BAL/WETH—the Balancer protocol liquidity pool—to get the B-80BAL-20WETH LP token.</>
                  }
                  heading="Add liquidity"
                  imgName="tokens"
                  step="1."
                />
              </FadeInOnView>
            </GridItem>
            <GridItem display="flex" height="100%">
              <FadeInOnView animateOnce={false}>
                <VebalStepCard
                  altText="LP token"
                  description={
                    <>Lock your B-80BAL-20WETH LP tokens for a period to receive veBAL. The longer you lock, the
                      more veBAL your get.</>
                  }
                  heading="Lock your LP tokens"
                  imgName="lptoken"
                  step="2."
                />
              </FadeInOnView>
            </GridItem>
            <GridItem display="flex" height="100%">
              <FadeInOnView animateOnce={false}>
                <VebalStepCard
                  altText="veBAL token"
                  description={
                    <>Earn protocol revenue + weekly voting incentives, boost liquidity mining, gain governance
                      power.</>
                  }
                  heading="Get power + rewards"
                  imgName="vebal"
                  step="3."
                />
              </FadeInOnView>
            </GridItem>
          </Grid>
        </Stack>
      </Section>
      <Box overflow="hidden" position="relative" py="100px">
        <Box zIndex="-1">
          <RadialPattern
            bottom="-800px"
            circleCount={12}
            height={1200}
            innerHeight={150}
            innerWidth={150}
            left="calc(50% - 600px)"
            position="absolute"
            width={1200}
          />
        </Box>
        <Center>
          <FadeInOnView animateOnce={false}>
            <Flex direction="column" gap="lg" textAlign="center">
              <Heading
                as="h2"
                backgroundClip="text"
                bg="background.gold"
                display="flex"
                justifyContent="center"
                pb="0.5"
                size="lg"
                width="full"
              >
                Calling all BAL holders
              </Heading>
              <Text
                color="font.secondary"
                display="flex"
                justifyContent="center"
                textAlign="center"
                width="full"
              >
                Turn your BAL tokens into voting power and rewards.
              </Text>
              <Flex
                display="flex"
                gap="ms"
                justifyContent="center"
                margin="0 auto"
                maxWidth={320}
                width="full"
              >
                <Button as={NextLink} flex={1} href="/vebal/manage" size="lg" variant="gold">
                  Manage veBAL
                </Button>

                <Button as={NextLink} flex={1} href="/vebal/vote" size="lg" variant="tertiary">
                  Vote on gauges
                </Button>
              </Flex>
            </Flex>
          </FadeInOnView>
        </Center>
      </Box>
    </>
  )
}
