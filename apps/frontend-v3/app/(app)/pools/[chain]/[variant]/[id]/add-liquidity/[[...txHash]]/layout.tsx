'use client'

import { AddLiquidityLayout } from '@repo/lib/shared/layouts/AddLiquidityLayout'
import { PropsWithChildren, use } from 'react'

type Props = PropsWithChildren<{
  params: Promise<{ txHash?: string[] }>
}>

export default function AddLiquidityLayoutWrapper({ params, children }: Props) {
  const resolvedParams = use(params)
  return <AddLiquidityLayout txHash={resolvedParams.txHash}>{children}</AddLiquidityLayout>
}
