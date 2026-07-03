import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GovernanceView } from './_components/GovernanceView'

export const metadata = {
  title: 'Governance · Balancer Analytics',
  description:
    'Snapshot proposals, veBAL stats, and where the BAL token currently lives across all supported chains.',
}

export default function GovernancePage() {
  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing="xl">
        <FadeInOnView animateOnce={false}>
          <Box>
            <Heading pb="sm" size="h3" sx={{ textWrap: 'balance' }} variant="special">
              Governance
            </Heading>
            <Text maxW="680px" sx={{ textWrap: 'balance' }} variant="secondary">
              BAL holder distribution and governance analytics.
            </Text>
          </Box>
        </FadeInOnView>

        <GovernanceView />
      </VStack>
    </DefaultPageContainer>
  )
}
