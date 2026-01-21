'use client'

import { Text, VStack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'

export function HowToParticipate() {
  const { isConnected } = useUserAccount()

  return (
    <VStack align="flex-start" flex="1" pr="15%" spacing="4">
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
            1. Mint fBEETS:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Convert BEETS into fBEETS (80% BEETS / 20% stS).
          </Text>
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            2. Create a maBEETS Position:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Add liquidity with fBEETS to create a maBEETS position that tracks maturity and voting
            power.
          </Text>
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            3. Vote & Earn:
          </Text>{' '}
          <Text as="span" variant="secondary">
            Vote on governance decisions, direct emissions, and earn governance-aligned rewards.
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
