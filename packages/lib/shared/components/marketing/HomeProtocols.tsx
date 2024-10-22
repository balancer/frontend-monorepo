'use client'
import { Heading, Text, Box, SimpleGrid } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

import { ParallaxImage } from '@repo/lib/shared/components/marketing/ParallaxImage'

import { Picture } from '@repo/lib/shared/components/other/Picture'

export function HomeProtocols() {
  return (
    <Section className="protocols">
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
              For Protocols
            </Text>
            <Heading
              as="h2"
              pb="md"
              size="2xl"
              sx={{
                textWrap: 'balance',
              }}
              w="full"
            >
              Plug in to DeFi&rsquo;s liquidity hub
            </Heading>
            <Text
              sx={{
                textWrap: 'balance',
              }}
            >
              Launch your token with confidence by plugging into the Balancer vault and ecosystem.
              Find product market fit and generate revenue faster with liquidity and community from
              day 1.
            </Text>
          </FadeInOnView>
        </Box>
      </Box>

      <Box m="0 auto" maxW="maxContent">
        <FadeInOnView>
          <ParallaxImage>
            <Picture
              altText="Pools plugged into Balancer vault"
              defaultImgType="png"
              height="775"
              imgAvif
              imgAvifPortrait
              imgName="bootstrap-liquidity"
              imgPng
              width="1320"
            />
          </ParallaxImage>
        </FadeInOnView>
      </Box>

      <Box m="0 auto" maxW="maxContent" px={{ base: 'md', xl: '0' }}>
        <FadeInOnView>
          <SimpleGrid columns={{ base: 2, md: 4 }} py="xl" spacing={{ base: 8, md: 8, xl: '12' }}>
            <Box>
              <Heading as="h5" pb="sm" size="h5" variant="h5">
                Get swaps on day 1
              </Heading>
              <Text>
                Access to the Balancer vault for smart swap routing via your pools. Plus, fast track
                inclusion to aggregator partners.
              </Text>
            </Box>
            <Box>
              <Heading as="h5" pb="sm" size="h5" variant="h5">
                Liquidity incentives
              </Heading>
              <Text>
                In addition to your own points / token, boost your liquidity by utilizing the veBAL
                system for BAL and AURA incentives.
              </Text>
            </Box>
            <Box>
              <Heading as="h5" pb="sm" size="h5" variant="h5">
                Access Balancer&lsquo;s community
              </Heading>
              <Text>
                By building on Balancer, LPs and swappers can find and / or interact with your AMM /
                pools via the ecosystem app.
              </Text>
            </Box>
            <Box>
              <Heading as="h5" pb="sm" size="h5" variant="h5">
                ve8020 tokenomics
              </Heading>
              <Text>
                Enable community staking & governance without sacrificing the liquidity of your
                token in a specialized 80/20 pool.
              </Text>
            </Box>
          </SimpleGrid>
        </FadeInOnView>
      </Box>
    </Section>
  )
}
