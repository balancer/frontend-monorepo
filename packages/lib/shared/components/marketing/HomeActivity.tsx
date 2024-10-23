import { Button, Center, Heading, Text, Flex, Box } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { EcosystemActivityChart } from '@repo/lib/shared/components/marketing/EcosystemActivityChart'
import { ProtocolStatsSection } from '@repo/lib/modules/marketing/ProtocolStatsSection'
import NextLink from 'next/link'

export function HomeActivity() {
  return (
    <Section className="activity">
      <Box m="0 auto" maxW="maxContent" pb="2xl" px={{ base: 'md', xl: '0' }}>
        <FadeInOnView>
          <Box m="auto" maxW="4xl" pb="xl" textAlign={{ base: 'left', md: 'center' }} w="full">
            <Heading pb="xl" w="full">
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

            <Box pb="lg" pt="md">
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
            m={{ base: 'none', md: 'auto' }}
            px={{ base: 'md', lg: '0' }}
            width="max-content"
          >
            <Button as={NextLink} flex="1" href="/pools" prefetch size="lg" variant="primary">
              Explore pools
            </Button>

            <Button as={NextLink} flex="1" href="/build/v3" prefetch size="lg" variant="secondary">
              Build on v3
            </Button>
          </Flex>
        </FadeInOnView>
      </Box>
    </Section>
  )
}
