'use client'

import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { Box, Text } from '@chakra-ui/react'

export default function RelicDepositPage({ params }: { params: { txHash?: string[] } }) {
  return (
    <RelicDepositProvider urlTxHash={params.txHash?.[0] as `0x${string}` | undefined}>
      <Box>
        <Text>Relic Deposit Page - Coming Soon</Text>
        {/* TODO: Add DepositForm, DepositImpactWarning, etc. */}
      </Box>
    </RelicDepositProvider>
  )
}
