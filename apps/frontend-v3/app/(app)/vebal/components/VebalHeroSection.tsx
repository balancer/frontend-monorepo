'use client'
import { Box, Button, Flex, Grid, GridItem, Heading, Stack, Text } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import NextLink from 'next/link'
import { RadialPattern } from '@/app/(marketing)/_lib/landing-v3/shared/RadialPattern'

export function VebalHeroSection() {
  return (
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
                    <Heading as="h2" backgroundClip="text" bg="background.gold" pb="0.5" size="lg">
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
  )
}
