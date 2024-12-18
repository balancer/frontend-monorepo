/* eslint-disable max-len */
import { Box } from '@chakra-ui/react'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Beets',
  description: `The Flagship LST Hub on Sonic. From seamless staking to earning real yield on LST-focused liquidity pools, beets is the ultimate destination for your liquid-staked tokens.`,
}

export default function MarketingLayout({ children }: PropsWithChildren) {
  return <Box>{children}</Box>
}
