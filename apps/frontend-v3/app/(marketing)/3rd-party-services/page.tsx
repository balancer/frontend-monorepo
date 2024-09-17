'use client'

import { Container, HStack, VStack, Image, Text } from '@chakra-ui/react'
import { Prose } from '@nikolovlazar/chakra-ui-prose'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

export default function Cookies() {
  const services = [
    {
      name: 'Infura',
      description: 'Used to fetch on-chain data and constructs contract calls with an Infura API.',
      iconUrl: '/images/services/infura.svg',
    },
    {
      name: 'Alchemy',
      description: 'Used to fetch on-chain data and constructs contract calls with an Alchemy API.',
      iconUrl: '/images/services/alchemy.svg',
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
      description: 'Used to capture and store user feedback from optional surveys',
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
  ]

  return (
    <Container>
      <Prose>
        <div className="pb-4">
          <FadeInOnView>
            <div className="subsection">
              <h1>Use of 3rd party services</h1>
              <p>
                <em>Last Updated: October 2023</em>
              </p>
              <p>
                Balancer is an open source, permissionless, decentralized protocol. The smart
                contracts that power the ecosystem may be used by anyone. This website is the
                Balancer Foundation&apos;s front-end to the ecosystem and it is also open-source.
                You are free to fork it on Github and modify it as you wish.
              </p>
              <p>This website uses the following 3rd party services:</p>
              <VStack w="full" align="start" spacing="xl">
                {services.map(service => (
                  <HStack key={service.name} align="start" spacing="md">
                    <Image
                      src={service.iconUrl}
                      alt={service.name}
                      borderRadius="full"
                      boxSize="50px"
                    />
                    <VStack w="full" align="start" lineHeight={1} spacing="xs">
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
