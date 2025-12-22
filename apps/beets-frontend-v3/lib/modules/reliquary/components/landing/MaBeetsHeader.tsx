'use client'

import { Heading, Link, Text, VStack } from '@chakra-ui/react'

export function MaBeetsHeader() {
  return (
    <VStack align="center" spacing="3" textAlign="center" width="full">
      <Heading color="white" sx={{ textWrap: 'balance' }} variant="special">
        <span
          style={{
            background: 'linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          maBEETs
        </span>{' '}
        Governance & Rewards
      </Heading>
      <Text sx={{ textWrap: 'balance' }} variant="secondary">
        Maturity-adjusted voting with governance aligned rewards.{' '}
        <Link
          color="#05D690"
          href="https://docs.beets.fi/tokenomics/mabeets"
          target="_blank"
          textDecoration="underline"
        >
          Learn more
        </Link>
      </Text>
    </VStack>
  )
}
