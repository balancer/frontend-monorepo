import { Button, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'

export function V3Grants() {
  return (
    <Section className="grants">
      <FadeInOnView>
        <Box m="0 auto" maxW="maxContent" px={{ base: 'md', xl: '0' }}>
          <Box
            m="auto"
            maxW="4xl"
            pb={{ base: 'md', md: 'lg' }}
            textAlign={{ base: 'left', md: 'center' }}
            w="full"
          >
            <Text pb="lg" variant="eyebrow" w="full">
              Balancer grants
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
              m={{ base: 'none', md: 'auto' }}
              width="max-content"
            >
              <Button
                as={NextLink}
                flex="1"
                href="https://grants.balancer.community"
                size="lg"
                variant="primary"
              >
                Get a Grant
              </Button>

              <Button
                as={NextLink}
                flex="1"
                href="https://docs-v3.balancer.fi/"
                size="lg"
                variant="secondary"
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
