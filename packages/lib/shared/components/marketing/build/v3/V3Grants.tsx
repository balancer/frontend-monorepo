import { Button, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'

export function V3Grants() {
  return (
    <Section className="grants">
      <FadeInOnView>
        <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }}>
          <Box
            pb={{ base: 'md', md: 'lg' }}
            w="full"
            maxW="4xl"
            m="auto"
            textAlign={{ base: 'left', md: 'center' }}
          >
            <Text pb="lg" variant="eyebrow" w="full">
              Balancer grants
            </Text>
            <Heading
              pb="md"
              as="h2"
              size="2xl"
              w="full"
              sx={{
                textWrap: 'balance',
              }}
            >
              Get help to innovate on v3
            </Heading>
            <Text
              pb="lg"
              sx={{
                textWrap: 'balance',
              }}
            >
              Balancer Community Grants aim to accelerate the development of the Balancer ecosystem.
              Grants for innovation on Balancer v3 will be prioritized. This program is managed by
              the Balancer Grants DAO, an independent community-owned grants program for the
              Balancer ecosystem.
            </Text>
            <Flex
              gap="ms"
              justify={{ base: 'start', md: 'center' }}
              width="max-content"
              m={{ base: 'none', md: 'auto' }}
            >
              <Button
                size="lg"
                as={NextLink}
                href="https://grants.balancer.community"
                variant="primary"
                flex="1"
              >
                Get a Grant
              </Button>

              <Button
                size="lg"
                as={NextLink}
                href="https://docs-v3.balancer.fi/"
                variant="secondary"
                flex="1"
              >
                View v3 docs
              </Button>
            </Flex>
          </Box>
        </Box>
      </FadeInOnView>
    </Section>
  )
}
