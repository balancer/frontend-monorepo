import { Button, Center, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@/lib/shared/components/layout/Section'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { EcosystemActivityChart } from '@/lib/shared/components/marketing/EcosystemActivityChart'
import { ProtocolStatsSection } from '@/lib/modules/marketing/ProtocolStatsSection'
import NextLink from 'next/link'

export function HomeActivity() {
  return (
    <Section className="activity">
      <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }} pb="2xl">
        <FadeInOnView>
          <Box pb="xl" w="full" maxW="4xl" m="auto" textAlign={{ base: 'left', md: 'center' }}>
            <Heading w="full" pb="xl">
              Building together &gt; Building alone
            </Heading>
            <Text
              pb="xl"
              sx={{
                textWrap: 'balance',
              }}
            >
              Balancer is a vibrant ecosystem. Explore the latest activity across all Balancer
              deployments including Ethereum, Arbitrum, Avalanche, and other L2 deployments.
            </Text>

            <Box pt="md" pb="lg">
              <ProtocolStatsSection />
            </Box>
          </Box>
        </FadeInOnView>
        <Box>
          <FadeInOnView>
            <Center w="full">
              <EcosystemActivityChart />
            </Center>
          </FadeInOnView>
        </Box>
      </Box>
      <Box>
        <FadeInOnView>
          <Flex
            gap="ms"
            justify={{ base: 'start', md: 'center' }}
            width="max-content"
            m={{ base: 'none', md: 'auto' }}
            px={{ base: 'md', lg: '0' }}
          >
            <Button
              flex="1"
              size="lg"
              as={NextLink}
              href="/pools"
              prefetch={true}
              variant="primary"
            >
              Explore pools
            </Button>

            <Button
              flex="1"
              size="lg"
              as={NextLink}
              href="/build/v3"
              prefetch={true}
              variant="secondary"
            >
              Build on v3
            </Button>
          </Flex>
        </FadeInOnView>
      </Box>
    </Section>
  )
}
