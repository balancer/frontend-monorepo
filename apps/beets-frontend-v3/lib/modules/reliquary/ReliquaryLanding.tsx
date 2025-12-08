'use client'

import { Box, Flex, Heading, VStack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { RelicCarousel } from './components/RelicCarousel'
import ReliquaryHeroBanner from './components/ReliquaryHeroBanner'
import ReliquaryGlobalStats from './components/stats/ReliquaryGlobalStats'
import { GetMaBeetsSteps } from './components/landing/GetMaBeetsSteps'
import { MyRelicsHeader } from './components/landing/MyRelicsHeader'
import { VotingPowerSection } from './components/landing/VotingPowerSection'
import { useSearchParams } from 'next/navigation'

export default function ReliquaryLanding() {
  const { isConnected } = useUserAccount()
  const searchParams = useSearchParams()
  const focusRelicId = searchParams.get('focusRelic')

  return (
    <>
      <Box mb="10" mt="10">
        <ReliquaryHeroBanner />
      </Box>
      <Flex>
        <Heading
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          mb="6"
          size="lg"
        >
          Get maBEETS
        </Heading>
        <Box flex="1" />
      </Flex>

      <GetMaBeetsSteps />

      <VStack py="4" spacing="8" width="full">
        {!isConnected && (
          <VStack alignItems="center" justifyContent="center" minH="200px">
            <ConnectWallet />
          </VStack>
        )}

        {isConnected && (
          <>
            <MyRelicsHeader />
            <Box width="full">
              <RelicCarousel focusRelicId={focusRelicId} />
            </Box>
            <VotingPowerSection />
          </>
        )}

        <VStack alignItems="flex-start" mt={{ base: '16' }} width="full">
          <Flex>
            <Heading
              background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
              backgroundClip="text"
              size="lg"
            >
              All relics
            </Heading>
            <Box flex="1" />
          </Flex>
        </VStack>

        <ReliquaryGlobalStats />
      </VStack>
    </>
  )
}
