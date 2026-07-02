'use client'

import { Box, Container, HStack, VStack, Image, Text } from '@chakra-ui/react'
import { Prose } from '@nikolovlazar/chakra-ui-prose'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export default function ThirdPartyServices() {
  const services = [
    {
      name: 'dRPC',
      description: 'Used to fetch on-chain data and to construct contract calls.',
      iconUrl: '/images/services/drpc.svg',
    },
    {
      name: 'The Graph',
      description: 'Used to fetch blockchain data from The Graph’s hosted service.',
      iconUrl: '/images/services/the-graph.svg',
    },
    {
      name: 'Hypernative',
      description:
        'Used to screen wallet addresses for risk and compliance purposes. Wallet addresses are shared with Hypernative Inc. to perform these checks.',
      iconUrl: '/images/services/hypernative.svg',
    },
    {
      name: 'Amazon Web Services',
      description:
        'Used for a variety of infrastructure services, but primarily to fetch and cache blockchain data.',
      iconUrl: '/images/services/aws.svg',
    },
    {
      name: 'Vercel',
      description: 'Used for deployment and hosting.',
      iconUrl: '/images/services/vercel.svg',
    },
    {
      name: 'CoinGecko',
      description: 'Used to fetch and display token information.',
      iconUrl: '/images/services/coingecko.svg',
    },
  ]

  return (
    <Container py="2xl">
      <Prose>
        <div className="pb-4">
          <FadeInOnView>
            <div className="subsection">
              <Box mt="3xl" pb="sm">
                <h1>Use of third-party services</h1>
                <p>
                  <em>Last updated: April 2025</em>
                </p>
                <p>
                  Beets is an open-source, permissionless, decentralized protocol. The smart
                  contracts that power the ecosystem may be used by anyone. This website is the
                  BeethovenX DAO&apos;s web interface to the ecosystem and is also open source. You
                  are free to fork it on GitHub and modify it as you wish.
                </p>
              </Box>
              <p>This website uses the following third-party services:</p>
              <VStack align="start" spacing="xl" w="full">
                {services.map(service => (
                  <HStack align="start" key={service.name} spacing="md">
                    <Image
                      alt={service.name}
                      borderRadius="full"
                      boxSize="50px"
                      src={service.iconUrl}
                    />
                    <VStack align="start" lineHeight={1} spacing="xs" w="full">
                      <Text as="span" fontSize="xl" fontWeight="bold">
                        {service.name}
                      </Text>
                      <Text as="span" color="grayText">
                        {service.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </div>
          </FadeInOnView>
        </div>
      </Prose>
    </Container>
  )
}
