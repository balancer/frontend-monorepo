'use client'

import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { PropsWithChildren } from 'react'
import { RelicIdProvider } from '@repo/lib/modules/pool/actions/add-liquidity/RelicIdProvider'

export default function RelicWithdrawLayoutWrapper({ children }: PropsWithChildren) {
  const { selectedRelic } = useReliquary()

  return <RelicIdProvider relicId={selectedRelic?.relicId}>{children}</RelicIdProvider>
}
