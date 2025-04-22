'use client'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import NextLink from 'next/link'

export function VebalHeroSection() {
  const radialPatternProps = useBreakpointValue({
    base: { circleCount: 10, height: 1000, width: 1000 },
    md: { circleCount: 15, height: 1500, width: 1500 },
    xl: { circleCount: 20, height: 2000, width: 2000 },
  })

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
          <Grid
            gap={{ base: '0', md: '4' }}
            h="100%"
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
          >
            {/* Content Column */}
            <GridItem minW={{ base: 'full', md: '420px' }} zIndex={1}>
              <FadeInOnView animateOnce={false}>
                <Stack
                  alignItems={{ base: 'center', md: 'start' }}
                  gap="md"
                  justifyContent="center"
                  margin={{ base: '0 auto', md: '0' }}
                  pl={{ md: 'md', '2xl': '0' }}
                  position="relative"
                  top={{ base: '0', md: '200px' }}
                >
                  <Stack alignItems={{ base: 'center', md: 'start' }} px="0">
                    <Heading
                      as="h2"
                      backgroundClip="text"
                      bg="background.gold"
                      pb="sm"
                      size="xl"
                      sx={{ textWrap: 'pretty' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
                      Lock-in for veBAL boosts
                    </Heading>
                    <Text
                      color="font.secondary"
                      lineHeight="1.4"
                      maxW="36ch"
                      mb="sm"
                      sx={{ textWrap: 'pretty' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
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

            <GridItem
              display="flex"
              justifyContent={{ base: 'center', md: 'flex-start' }}
              zIndex={0}
            >
              <FadeInOnView animateOnce={false}>
                <Box
                  margin={{ base: '32px auto', md: '0' }}
                  position="relative"
                  width={{ base: '98%', md: 'clamp(800px, 85vw, 1200px)' }}
                >
                  <RadialPattern
                    circleCount={radialPatternProps?.circleCount}
                    height={radialPatternProps?.height}
                    left="50%"
                    position="absolute"
                    top="50%"
                    transform="translate(-50%, -50%)"
                    width={radialPatternProps?.width}
                    zIndex={-1}
                  />
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
