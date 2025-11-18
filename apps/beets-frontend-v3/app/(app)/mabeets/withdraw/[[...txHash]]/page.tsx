'use client'

import { RelicWithdrawProvider } from '@/lib/modules/reliquary/RelicWithdrawProvider'
import { Box, Text } from '@chakra-ui/react'

export default function RelicWithdrawPage({ params }: { params: { txHash?: string[] } }) {
  return (
    <RelicWithdrawProvider urlTxHash={params.txHash?.[0] as `0x${string}` | undefined}>
      <Box>
        <Text>Relic Withdraw Page - Coming Soon</Text>
        {/* TODO: Add WithdrawForm, etc. */}
      </Box>
    </RelicWithdrawProvider>
  )
}
