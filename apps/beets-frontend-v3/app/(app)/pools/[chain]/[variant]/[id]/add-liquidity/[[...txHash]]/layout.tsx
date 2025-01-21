'use client'

import { AddLiquidityLayout } from '@repo/lib/shared/layouts/AddLiquidityLayout'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function AddLiquidityLayoutWrapper({ params: { txHash }, children }: Props) {
  return <AddLiquidityLayout txHash={txHash}>{children}</AddLiquidityLayout>
}
