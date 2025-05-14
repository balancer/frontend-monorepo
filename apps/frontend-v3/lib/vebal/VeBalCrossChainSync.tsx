import { Box, Heading, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

export function VeBalCrossChainSync() {
  return (
    <Box>
      <Heading as="h3" mb="ms" pb="0.5" size="md" variant="special">
        Cross-chain veBAL boosts
      </Heading>
      <Text>
        To sync veBAL to L2s to maximize liquidity incentives, go to the{' '}
        <Link
          href="https://app.balancer.fi/#/ethereum/vebal"
          style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'baseline' }}
          target="_blank"
        >
          legacy site
          <ArrowUpRight size={12} style={{ marginLeft: 2 }} />
        </Link>
      </Text>
    </Box>
  )
}
