'use client'

import { VebalManage } from '@/lib/modules/vebal/VebalManage'
import { CrossChainBoost } from '@/lib/modules/vebal/cross-chain/CrossChainBoost'
import { Stack } from '@chakra-ui/react'

export default function VebalManagePage() {
  return (
    <Stack gap="lg">
      <VebalManage />
      <CrossChainBoost />
    </Stack>
  )
}
