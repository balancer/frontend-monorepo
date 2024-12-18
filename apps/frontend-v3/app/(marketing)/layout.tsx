/* eslint-disable max-len */
import { Box } from '@chakra-ui/react'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Balancer DeFi AMMs made easy',
  description: `DeFi's most extensive AMM product suite—Balancer is a decentralized Automated Market Maker protocol built on Ethereum with a clear focus on fungible and yield-bearing liquidity.`,
}

export default function MarketingLayout({ children }: PropsWithChildren) {
  return <Box>{children}</Box>
}
