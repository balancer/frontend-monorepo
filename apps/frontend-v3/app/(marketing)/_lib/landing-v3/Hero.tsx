'use client'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
import {
  Box,
  Button,
  Link,
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
import { PlayVideoButton } from '@repo/lib/shared/components/btns/PlayVideoButton'
import LiquidMetal from '@bal/app/(marketing)/_lib/landing-v3/shared/LiquidMetal'
import { ArrowUpRight } from 'react-feather'

export function Hero() {
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
          h={{ base: '700px', md: '800px' }}
          minH={{ lg: 'calc(95vh - 60px)' }}
          pb={['0', '0', '10']}
          position="relative"
          pt={['xl', '40px']}
          px="0"
        >
          <Grid
            alignItems="center"
            gap={{ base: '0', md: '4' }}
            h="100%"
            overflow={{ base: 'hidden', md: 'visible' }}
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
                >
                  <Stack alignItems={{ base: 'center', md: 'start' }} px="0">
                    <Text
                      background="background.special"
                      backgroundClip="text"
                      fontSize="xs"
                      letterSpacing="1.5px"
                      mb="md"
                      variant="eyebrow"
                    >
                      Balancer v3 is live
                    </Text>
                    <Heading
                      as="h2"
                      pb="ms"
                      size="2xl"
                      sx={{ textWrap: 'pretty' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
                      AMMs made easy
                    </Heading>
                    <Text
                      color="font.secondary"
                      fontSize="md"
                      lineHeight="1.4"
                      maxW="35ch"
                      mb="sm"
                      sx={{ textWrap: 'pretty' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
                      The ultimate platform for building custom DeFi liquidity pools. A perfect
                      balance of simplicity and flexibility. Build the future of AMMs on Balancer.
                    </Text>
                  </Stack>

                  <Flex gap="ms" maxWidth={360} mb="ms">
                    <Button
                      as={Link}
                      href="https://docs.balancer.fi"
                      rel="noopener"
                      rightIcon={<ArrowUpRight size="14px" />}
                      size="lg"
                      target="_blank"
                      variant="primary"
                    >
                      View v3 docs
                    </Button>

                    <Box bg="background.level1">
                      <Button
                        as={Link}
                        href="https://github.com/balancer/scaffold-balancer-v3"
                        rel="noopener"
                        rightIcon={<ArrowUpRight size="14px" />}
                        size="lg"
                        target="_blank"
                        variant="tertiary"
                      >
                        Prototype v3
                      </Button>
                    </Box>
                  </Flex>
                  <Link
                    color="font.secondary"
                    fontSize="sm"
                    href="https://youtu.be/vjB2cogaO-c?si=E3q4o82JfPz-Hwkk"
                  >
                    <Flex alignItems="center" gap="sm">
                      <Box height="28px" rounded="full" width="28px">
                        <PlayVideoButton size={7} />
                      </Box>
                      <Text color="font.secondary" fontSize="sm">
                        Watch Balancer v3 intro
                      </Text>
                    </Flex>
                  </Link>
                </Stack>
              </FadeInOnView>
            </GridItem>
            {/* Image Column */}
            <GridItem
              display="flex"
              justifyContent={{ base: 'center', md: 'flex-start' }}
              zIndex={0}
            >
              <FadeInOnView animateOnce={false}>
                <Box
                  margin={{ base: '32px auto', md: '0' }}
                  position="relative"
                  sx={{
                    '@keyframes scaleUpFadeIn': {
                      from: { opacity: 0, transform: 'scale(0.8)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                    },
                    animation: `scaleUpFadeIn 1s ease-out forwards`,
                  }}
                  width={{ base: 'calc(100% - 100px)', md: 'clamp(800px, 85vw, 800px)' }}
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
                  <Box boxShadow="0 40px 80px rgba(0, 0, 0, 0.5)" rounded="full">
                    <Box
                      bg="#31373F"
                      overflow="hidden"
                      position="relative"
                      rounded="full"
                      shadow="2xl"
                    >
                      <Picture
                        altText="Balancer protocol"
                        defaultImgType="jpg"
                        directory="/images/textures/"
                        fetchPriority="high"
                        imgAvif
                        imgJpg
                        imgName="slate-square-large"
                        loading="eager"
                      />
                      <Box
                        h="full"
                        left="0"
                        position="absolute"
                        rounded="full"
                        shadow="innerRockShadowXl"
                        top="0"
                        w="full"
                      />
                      <Box
                        inset="0"
                        pointerEvents="none"
                        position="absolute"
                        sx={{
                          '@keyframes shaderFadeIn': {
                            from: { opacity: 0 },
                            to: { opacity: 1 },
                          },
                          animation: 'shaderFadeIn 0.6s ease-out 0.2s both',
                        }}
                      >
                        <LiquidMetal size="100%" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </FadeInOnView>
            </GridItem>
          </Grid>
        </DefaultPageContainer>
      </Noise>
    </Box>
  )
}
