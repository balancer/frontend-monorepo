import { Box } from '@chakra-ui/react'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: `Balancer—AMMs made easy`,
  description: `DeFi's most extensive AMM product suite. The Balancer protocol delivers fungible and yield-bearing liquidity across Ethereum and select EVM chains.`,
  openGraph: {
    title: `Balancer—AMMs made easy`,
    description: `DeFi's most extensive AMM product suite. The Balancer protocol delivers fungible and yield-bearing liquidity across Ethereum and select EVM chains.`,
    siteName: 'Balancer',
  },
}

export default function MarketingLayout({ children }: PropsWithChildren) {
  return <Box>{children}</Box>
}
