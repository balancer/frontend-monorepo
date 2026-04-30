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
  HStack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { ArrowUpRight } from 'react-feather'
import { PlayVideoButton } from '@repo/lib/shared/components/btns/PlayVideoButton'

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
          h={{ base: '500px', md: '800px' }}
          pb={['0', '0', '10']}
          position="relative"
          pt={['xl', '40px']}
          px="0"
        >
          <Grid
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
                  position="relative"
                  top={{ base: '0', md: '200px' }}
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
                      fontSize="48px"
                      pb="sm"
                      sx={{ textWrap: 'pretty' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
                      AMMs made easy
                    </Heading>
                    <Text
                      color="font.secondary"
                      lineHeight="1.4"
                      maxW="36ch"
                      mb="sm"
                      sx={{ textWrap: 'balance' }}
                      textAlign={{ base: 'center', md: 'start' }}
                    >
                      The ultimate platform for custom liquidity solutions. Balancer v3 perfectly
                      balances simplicity and flexibility to reshape the future of AMMs.
                    </Text>
                  </Stack>

                  <Flex gap="ms" maxWidth={320} mb="ms">
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

                  <HStack
                    alignItems="center"
                    as={Link}
                    href="https://youtu.be/vjB2cogaO-c?si=E3q4o82JfPz-Hwkk"
                    mt="2"
                    spacing="ms"
                  >
                    <PlayVideoButton isRound={false} size={8} sx={{ borderRadius: 'xs' }} />
                    <Text color="font.secondary">Learn about Balancer v3</Text>
                  </HStack>
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
                  sx={{
                    '@keyframes scaleUpFadeIn': {
                      from: { opacity: 0, transform: 'scale(0.8)' },
                      to: { opacity: 1, transform: 'scale(1)' },
                    },
                    animation: `scaleUpFadeIn 1s ease-out forwards`,
                  }}
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
