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
          maBEETS
        </span>{' '}
        Governance & Rewards
      </Heading>
      <Text sx={{ textWrap: 'balance' }} variant="secondary">
        Maturity-adjusted governance power without the lock-ups.{' '}
        <Link
          color="font.highlight"
          href="https://docs.beets.fi/tokenomics/mabeets"
          isExternal
          textDecoration="underline"
        >
          Learn more
        </Link>
      </Text>
    </VStack>
  )
}
