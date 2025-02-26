'use client'

import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { AddLiquidityLayout } from '@repo/lib/shared/layouts/AddLiquidityLayout'
import { PropsWithChildren } from 'react'
import { RelicIdProvider } from '@repo/lib/modules/pool/actions/add-liquidity/RelicIdProvider'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function AddLiquidityLayoutWrapper({ params: { txHash }, children }: Props) {
  const { selectedRelic } = useReliquary()

  return (
    <RelicIdProvider relicId={selectedRelic?.relicId}>
      <AddLiquidityLayout txHash={txHash}>{children}</AddLiquidityLayout>
    </RelicIdProvider>
  )
}
