'use client'

import { Text, VStack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'

export function HowToParticipate() {
  const { isConnected } = useUserAccount()

  return (
    <VStack align="flex-start" flex="1" spacing="4" width="full">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        How to Participate
      </Text>
      <VStack align="flex-start" spacing="3" width="full">
        <Text>
          <Text as="span" fontWeight="bold">
            1. fBeets:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Invest BEETS/stS (80/20) into the Fresh BEETS pool to receive fBEETS.
          </Text>
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            2. Reliquary:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Deposit fBEETS into Reliquary to unlock your maturity adjusted position.
          </Text>
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            3. maBEETS:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Receive a transferable and composable Relic that holds your maBEETS position.
          </Text>
        </Text>
      </VStack>

      {!isConnected && (
        <VStack align="flex-start" pt="4" spacing="3" width="full">
          <Text fontWeight="bold">Get started by connecting your wallet</Text>
          <ConnectWallet />
        </VStack>
      )}
    </VStack>
  )
}
