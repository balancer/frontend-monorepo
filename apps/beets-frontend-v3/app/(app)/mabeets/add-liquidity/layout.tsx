'use client'

import { useReliquary } from '@/lib/modules/reliquary/ReliquaryProvider'
import { AddLiquidityLayout } from '@repo/lib/shared/layouts/AddLiquidityLayout'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function AddLiquidityLayoutWrapper({ params: { txHash }, children }: Props) {
  const { selectedRelic } = useReliquary()

  return (
    <AddLiquidityLayout relicId={selectedRelic?.relicId} txHash={txHash}>
      {children}
    </AddLiquidityLayout>
  )
}
