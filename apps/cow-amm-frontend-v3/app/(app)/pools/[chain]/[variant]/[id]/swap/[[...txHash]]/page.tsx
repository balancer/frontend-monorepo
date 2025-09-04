'use client'

import { PoolSwapPage } from '@repo/lib/shared/pages/PoolSwapPage'
import { use } from 'react'

type Props = {
  params: Promise<{ txHash?: string[] }>
}
// Page for swapping from a pool page
export default function PoolSwapPageWrapper({ params }: Props) {
  const resolvedParams = use(params)
  return <PoolSwapPage txHash={resolvedParams.txHash} />
}
