'use client'

import { Box, Container, HStack, VStack, Image, Text } from '@chakra-ui/react'
import { Prose } from '@nikolovlazar/chakra-ui-prose'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export default function Cookies() {
  const services = [
    {
      name: 'dRPC',
      description: 'Used to fech on-chain data and to construct contract calls.',
      iconUrl: '/images/services/drpc.svg',
    },
    {
      name: 'The Graph',
      description: 'Used to fetch blockchain data from The Graph’s hosted service.',
      iconUrl: '/images/services/the-graph.svg',
    },
    {
      name: 'Fathom Analytics',
      description: 'Used to understand user behavior on the site and marketing performance.',
      iconUrl: '/images/services/fathom-analytics.svg',
    },
    {
      name: 'Appzi',
      description: 'Used to capture and store user feedback from optional surveys.',
      iconUrl: '/images/services/appzi.svg',
    },
    {
      name: 'Hypernative',
      description:
        'Used to securely check wallet addresses and shares it with Hypernative Inc. for risk and compliance reasons.',
      iconUrl: '/images/services/hypernative.svg',
    },
    {
      name: 'Sentry',
      description: 'Used for error tracking and performance monitoring.',
      iconUrl: '/images/services/sentry.svg',
    },
    {
      name: 'Amazon Web Services',
      description:
        'Used for a variety of infrastructure services, but primarily to fetch and cache blockchain data.',
      iconUrl: '/images/services/aws.svg',
    },
    {
      name: 'OpenZeppelin',
      description: 'Used for security and compliance monitoring.',
      iconUrl: '/images/services/open-zeppelin.svg',
    },
    {
      name: 'Vercel',
      description: 'Used for deployment and hosting.',
      iconUrl: '/images/services/vercel.svg',
    },
    {
      name: 'Coingecko',
      description: 'Used to fetch and display token information.',
      iconUrl: '/images/services/coingecko.svg',
    },
  ]

  return (
    <Container>
      <Prose>
        <div className="pb-4">
          <FadeInOnView>
            <div className="subsection">
              <Box mt="3xl" pb="sm">
                <h1>Use of third-party services</h1>
                <p>
                  <em>Last Updated: April 2025</em>
                </p>
                <p>
                  Balancer is an open source, permissionless, decentralized protocol. The smart
                  contracts that power the ecosystem may be used by anyone. This website is the
                  Balancer Foundation&apos;s front-end to the ecosystem and it is also open-source.
                  You are free to fork it on Github and modify it as you wish.
                </p>
              </Box>
              <p>This website uses the following 3rd party services:</p>
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
