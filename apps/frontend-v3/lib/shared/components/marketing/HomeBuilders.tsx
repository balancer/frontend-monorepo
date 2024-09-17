import { Card, Grid, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@/lib/shared/components/layout/Section'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

import { ParallaxImage } from '@/lib/shared/components/marketing/ParallaxImage'

import { Picture } from '@/lib/shared/components/other/Picture'

export function HomeBuilders() {
  return (
    <Section className="builders">
      <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }}>
        <Box
          pb={{ base: 'md', md: 'lg' }}
          w="full"
          maxW="4xl"
          m="auto"
          textAlign={{ base: 'left', md: 'center' }}
        >
          <FadeInOnView>
            <Text pb="lg" variant="eyebrow" w="full">
              For Builders
            </Text>
            <Heading
              pb="md"
              w="full"
              as="h2"
              size="2xl"
              sx={{
                textWrap: 'balance',
              }}
            >
              DeFi&rsquo;s most extensive AMM product suite
            </Heading>
            <Text
              w="full"
              sx={{
                textWrap: 'balance',
              }}
            >
              Balancer is a Decentralized Finance (DeFi) protocol that provides permissionless
              technology to streamline AMM development for developers and empower liquidity
              providers with an ever-expanding DEX product suite.
            </Text>
          </FadeInOnView>
        </Box>

        <FadeInOnView>
          <Box maxW={{ base: '720px', lg: '100%' }} mx="auto">
            <Grid
              templateRows={{ base: 'repeat(4, 1fr', md: 'repeat(3, 1fr', lg: 'repeat(2, 1fr' }}
              templateColumns={{
                base: 'repeat(1, 1fr',
                md: 'repeat(2, 1fr',
                lg: 'repeat(4, 1fr',
              }}
              gap={4}
            >
              <Card
                variant="level2"
                gridArea={{ base: 'auto', md: '1 / 1 / 2 / 3', lg: '1 / 1 / 3 / 3' }}
              >
                <Flex direction="column" justify="flex-end" h="100%">
                  <Box overflow="hidden" pb="md" rounded="lg" h="100%">
                    <ParallaxImage
                      scaleStart="100%"
                      scaleEnd="120%"
                      yStart="-10%"
                      yEnd="30%"
                      transformOrigin="bottom"
                    >
                      <Picture
                        imgName="build"
                        altText="Liquidity pools"
                        defaultImgType="jpg"
                        imgJpg={true}
                        imgAvif={true}
                        imgAvifDark={true}
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    size="h5"
                    pb="sm"
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Code less. Build more.
                  </Heading>
                  <Text
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Focus on innovation rather than low level tasks like accounting and security.
                    Simply supply custom AMM logic, and harness the full benefit of an optimized,
                    battle-tested tech stack.
                  </Text>
                </Flex>
              </Card>

              <Card>
                <Flex direction="column" justify="flex-end" h="100%">
                  <Box overflow="hidden" pb="md" rounded="lg" h="100%">
                    <ParallaxImage
                      scaleStart="100%"
                      scaleEnd="120%"
                      yStart="-10%"
                      yEnd="30%"
                      transformOrigin="bottom"
                    >
                      <Picture
                        imgName="vebal"
                        altText="veBAL tokens"
                        defaultImgType="jpg"
                        imgJpg={true}
                        imgJpgDark={true}
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    size="h5"
                    pb="sm"
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Booststrap liquidity
                  </Heading>
                  <Text
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Plug into Balancer&lsquo;s veBAL incentive mechanism and grants framework to
                    bootstrap AMM liquidity.
                  </Text>
                </Flex>
              </Card>

              <Card>
                <Flex direction="column" justify="flex-end" h="100%">
                  <Box overflow="hidden" pb="md" rounded="lg" h="100%">
                    <ParallaxImage
                      scaleStart="100%"
                      scaleEnd="120%"
                      yStart="-10%"
                      yEnd="30%"
                      transformOrigin="bottom"
                    >
                      <Picture
                        imgName="aggregators"
                        altText="Aggregator integrations like CoW, 1inch and Paraswap"
                        defaultImgType="jpg"
                        imgJpg={true}
                        imgJpgDark={true}
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    size="h5"
                    pb="sm"
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Launch your product faster
                  </Heading>
                  <Text
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Eliminate the cold start AMM problem with streamlined aggregator integrations
                    and a prebuilt UI.
                  </Text>
                </Flex>
              </Card>

              <Card gridArea={{ base: 'auto', md: '3 / 1 / 4 / 3', lg: '1 / 4 / 3 / 5' }}>
                <Flex direction="column" justify="flex-end" h="100%">
                  <Box overflow="hidden" pb="md" rounded="lg" h="100%">
                    <ParallaxImage
                      scaleStart="100%"
                      scaleEnd="120%"
                      yStart="-10%"
                      yEnd="30%"
                      transformOrigin="bottom"
                    >
                      <Picture
                        imgName="network"
                        altText="The Balancer network"
                        defaultImgType="jpg"
                        imgAvif={true}
                        imgAvifDark={true}
                        imgAvifPortrait={true}
                        imgAvifPortraitDark={true}
                        imgJpgDark={true}
                        imgJpg={true}
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    size="h5"
                    pb="sm"
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Join the largest AMM network
                  </Heading>
                  <Text
                    sx={{
                      textWrap: 'balance',
                    }}
                  >
                    Unlock an extensive network of AMM expertise, audit pipelines, and partnership
                    connections.
                  </Text>
                </Flex>
              </Card>
            </Grid>
          </Box>
        </FadeInOnView>
      </Box>
    </Section>
  )
}
