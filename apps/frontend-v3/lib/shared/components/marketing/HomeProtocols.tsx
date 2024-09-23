'use client'
import { Heading, Text, Box, SimpleGrid } from '@chakra-ui/react'
import Section from '@/lib/shared/components/layout/Section'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

import { ParallaxImage } from '@/lib/shared/components/marketing/ParallaxImage'

import { Picture } from '@/lib/shared/components/other/Picture'

export function HomeProtocols() {
  return (
    <Section className="protocols">
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
              For Protocols
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

      <Box maxW="maxContent" m="0 auto">
        <FadeInOnView>
          <ParallaxImage>
            <Picture
              imgName="bootstrap-liquidity"
              altText="Pools plugged into Balancer vault"
              width="1320"
              height="775"
              defaultImgType="png"
              imgAvif={true}
              imgPng={true}
              imgAvifPortrait={true}
            />
          </ParallaxImage>
        </FadeInOnView>
      </Box>

      <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }}>
        <FadeInOnView>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 8, md: 8, xl: '12' }} py="xl">
            <Box>
              <Heading variant="h5" as="h5" size="h5" pb="sm">
                Get swaps on day 1
              </Heading>
              <Text>
                Access to the Balancer vault for smart swap routing via your pools. Plus, fast track
                inclusion to aggregator partners.
              </Text>
            </Box>
            <Box>
              <Heading variant="h5" as="h5" size="h5" pb="sm">
                Liquidity incentives
              </Heading>
              <Text>
                In addition to your own points / token, boost your liquidity by utilizing the veBAL
                system for BAL and AURA incentives.
              </Text>
            </Box>
            <Box>
              <Heading variant="h5" as="h5" size="h5" pb="sm">
                Access Balancer&lsquo;s community
              </Heading>
              <Text>
                By building on Balancer, LPs and swappers can find and / or interact with your AMM /
                pools via the ecosystem app.
              </Text>
            </Box>
            <Box>
              <Heading variant="h5" as="h5" size="h5" pb="sm">
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
