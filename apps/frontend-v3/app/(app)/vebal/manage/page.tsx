'use client'

import { VebalManage } from '@/lib/vebal/VebalManage'
// import { CrossChainBoost } from '@/lib/vebal/cross-chain/CrossChainBoost'
import { Stack } from '@chakra-ui/react'

export default function VebalManagePage() {
  return (
    <Stack gap="lg">
      <VebalManage />
      {/* <CrossChainBoost /> */}
    </Stack>
  )
}
