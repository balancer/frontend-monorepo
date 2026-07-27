import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { notFound } from 'next/navigation'
import { PortfolioAddressInput } from '../_components/PortfolioAddressInput'
import { PortfolioView } from '../_components/PortfolioView'

type Props = { params: Promise<{ address: string }> }

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export async function generateMetadata({ params }: Props) {
  const { address } = await params
  if (!ADDRESS_RE.test(address)) return {}
  return {
    title: `Portfolio · ${address.slice(0, 6)}…${address.slice(-4)} · Balancer Analytics`,
    description: `Balancer LP positions, rewards, and token exposure for ${address}.`,
  }
}

export default async function PortfolioAddressPage({ params }: Props) {
  const { address: rawAddress } = await params
  // Normalize early so the page is canonical-lowercase. We don't redirect
  // mixed-case → lowercase because Next's `redirect()` from a server
  // component is unnecessary churn when the URL is already valid.
  if (!ADDRESS_RE.test(rawAddress)) notFound()
  const address = rawAddress.toLowerCase()

  return (
    <DefaultPageContainer pb="2xl" pt={['md', 'lg']}>
      <VStack align="stretch" spacing={{ base: 'lg', md: 'xl' }}>
        <FadeInOnView animateOnce={false}>
          <Box>
            <Heading pb="xs" size="h3" sx={{ textWrap: 'balance' }} variant="special">
              Portfolio
            </Heading>
            <Text color="font.secondary" fontFamily="mono" fontSize="sm">
              {address}
            </Text>
          </Box>
        </FadeInOnView>

        <FadeInOnView animateOnce={false}>
          <PortfolioAddressInput initialValue={address} />
        </FadeInOnView>

        <PortfolioView address={address} />
      </VStack>
    </DefaultPageContainer>
  )
}
