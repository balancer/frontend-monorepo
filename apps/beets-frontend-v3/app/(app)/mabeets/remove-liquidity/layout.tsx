'use client'

import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { PropsWithChildren } from 'react'
import { RelicIdProvider } from '@repo/lib/modules/pool/actions/add-liquidity/RelicIdProvider'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RemoveLiquidityLayoutWrapper({ children }: Props) {
  const { selectedRelic } = useReliquary()

  return <RelicIdProvider relicId={selectedRelic?.relicId}>{children}</RelicIdProvider>
}
