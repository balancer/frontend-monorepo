import { Card, Grid, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

import { ParallaxImage } from '@repo/lib/shared/components/marketing/ParallaxImage'

import { Picture } from '@repo/lib/shared/components/other/Picture'

export function HomeBuilders() {
  return (
    <Section className="builders">
      <Box m="0 auto" maxW="maxContent" px={{ base: 'md', xl: '0' }}>
        <Box
          m="auto"
          maxW="4xl"
          pb={{ base: 'md', md: 'lg' }}
          textAlign={{ base: 'left', md: 'center' }}
          w="full"
        >
          <FadeInOnView>
            <Text pb="lg" variant="eyebrow" w="full">
              For Builders
            </Text>
            <Heading
              as="h2"
              css={{
                textWrap: 'balance',
              }}
              pb="md"
              size="2xl"
              w="full"
            >
              DeFi&rsquo;s most extensive AMM product suite
            </Heading>
            <Text
              css={{
                textWrap: 'balance',
              }}
              w="full"
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
              gap={4}
              templateColumns={{
                base: 'repeat(1, 1fr',
                md: 'repeat(2, 1fr',
                lg: 'repeat(4, 1fr',
              }}
              templateRows={{ base: 'repeat(4, 1fr', md: 'repeat(3, 1fr', lg: 'repeat(2, 1fr' }}
            >
              <Card.Root
                gridArea={{ base: 'auto', md: '1 / 1 / 2 / 3', lg: '1 / 1 / 3 / 3' }}
                variant="level2"
              >
                <Flex direction="column" h="100%" justify="flex-end">
                  <Box h="100%" overflow="hidden" pb="md" rounded="lg">
                    <ParallaxImage
                      scaleEnd="120%"
                      scaleStart="100%"
                      transformOrigin="bottom"
                      yEnd="30%"
                      yStart="-10%"
                    >
                      <Picture
                        altText="Liquidity pools"
                        defaultImgType="jpg"
                        imgAvif
                        imgAvifDark
                        imgJpg
                        imgName="build"
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    css={{
                      textWrap: 'balance',
                    }}
                    pb="sm"
                    size="h5"
                  >
                    Code less. Build more.
                  </Heading>
                  <Text
                    css={{
                      textWrap: 'balance',
                    }}
                  >
                    Focus on innovation rather than low level tasks like accounting and security.
                    Simply supply custom AMM logic, and harness the full benefit of an optimized,
                    battle-tested tech stack.
                  </Text>
                </Flex>
              </Card.Root>

              <Card.Root>
                <Flex direction="column" h="100%" justify="flex-end">
                  <Box h="100%" overflow="hidden" pb="md" rounded="lg">
                    <ParallaxImage
                      scaleEnd="120%"
                      scaleStart="100%"
                      transformOrigin="bottom"
                      yEnd="30%"
                      yStart="-10%"
                    >
                      <Picture
                        altText="veBAL tokens"
                        defaultImgType="jpg"
                        imgJpg
                        imgJpgDark
                        imgName="vebal"
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    css={{
                      textWrap: 'balance',
                    }}
                    pb="sm"
                    size="h5"
                  >
                    Booststrap liquidity
                  </Heading>
                  <Text
                    css={{
                      textWrap: 'balance',
                    }}
                  >
                    Plug into Balancer&lsquo;s veBAL incentive mechanism and grants framework to
                    bootstrap AMM liquidity.
                  </Text>
                </Flex>
              </Card.Root>

              <Card.Root>
                <Flex direction="column" h="100%" justify="flex-end">
                  <Box h="100%" overflow="hidden" pb="md" rounded="lg">
                    <ParallaxImage
                      scaleEnd="120%"
                      scaleStart="100%"
                      transformOrigin="bottom"
                      yEnd="30%"
                      yStart="-10%"
                    >
                      <Picture
                        altText="Aggregator integrations like CoW, 1inch and Paraswap"
                        defaultImgType="jpg"
                        imgJpg
                        imgJpgDark
                        imgName="aggregators"
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    css={{
                      textWrap: 'balance',
                    }}
                    pb="sm"
                    size="h5"
                  >
                    Launch your product faster
                  </Heading>
                  <Text
                    css={{
                      textWrap: 'balance',
                    }}
                  >
                    Eliminate the cold start AMM problem with streamlined aggregator integrations
                    and a prebuilt UI.
                  </Text>
                </Flex>
              </Card.Root>

              <Card.Root gridArea={{ base: 'auto', md: '3 / 1 / 4 / 3', lg: '1 / 4 / 3 / 5' }}>
                <Flex direction="column" h="100%" justify="flex-end">
                  <Box h="100%" overflow="hidden" pb="md" rounded="lg">
                    <ParallaxImage
                      scaleEnd="120%"
                      scaleStart="100%"
                      transformOrigin="bottom"
                      yEnd="30%"
                      yStart="-10%"
                    >
                      <Picture
                        altText="The Balancer network"
                        defaultImgType="jpg"
                        imgAvif
                        imgAvifDark
                        imgAvifPortrait
                        imgAvifPortraitDark
                        imgJpg
                        imgJpgDark
                        imgName="network"
                      />
                    </ParallaxImage>
                  </Box>
                  <Heading
                    as="h5"
                    css={{
                      textWrap: 'balance',
                    }}
                    pb="sm"
                    size="h5"
                  >
                    Join the largest AMM network
                  </Heading>
                  <Text
                    css={{
                      textWrap: 'balance',
                    }}
                  >
                    Unlock an extensive network of AMM expertise, audit pipelines, and partnership
                    connections.
                  </Text>
                </Flex>
              </Card.Root>
            </Grid>
          </Box>
        </FadeInOnView>
      </Box>
    </Section>
  )
}
