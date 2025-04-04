'use client'

import { VebalManage } from '@repo/lib/modules/vebal/VebalManage'
// import { CrossChainBoost } from '@repo/lib/modules/vebal/cross-chain/CrossChainBoost'
import { Stack } from '@chakra-ui/react'

export default function VebalManagePage() {
  return (
    <Stack gap="lg">
      <VebalManage />
      {/* <CrossChainBoost /> */}
    </Stack>
  )
}
