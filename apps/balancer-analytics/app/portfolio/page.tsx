import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { PortfolioAddressInput } from './_components/PortfolioAddressInput'

export const metadata = {
  title: 'Portfolio · Balancer Analytics',
  description: 'Inspect any wallet’s Balancer LP positions, rewards, and token exposure.',
}

export default function PortfolioLandingPage() {
  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing="xl">
        <FadeInOnView animateOnce={false}>
          <Box>
            <Heading pb="sm" size="h3" sx={{ textWrap: 'balance' }} variant="special">
              Portfolio inspector
            </Heading>
            <Text maxW="640px" sx={{ textWrap: 'balance' }} variant="secondary">
              Paste any wallet address or ENS name to inspect its Balancer v2, v3 and CoW AMM
              positions — token exposure, projected daily yield, reward streams, and share of
              protocol TVL.
            </Text>
          </Box>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <PortfolioAddressInput />
        </FadeInOnView>
      </VStack>
    </DefaultPageContainer>
  )
}
