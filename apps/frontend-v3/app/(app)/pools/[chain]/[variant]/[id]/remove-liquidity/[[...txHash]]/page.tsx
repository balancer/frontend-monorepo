'use client'

import { RemoveLiquidityPage } from '@repo/lib/shared/pages/RemoveLiquidityPage'
import { use } from 'react'

type Props = {
  params: Promise<{ txHash?: string[] }>
}

export default function RemoveLiquidityPageWrapper({ params }: Props) {
  const resolvedParams = use(params)
  return <RemoveLiquidityPage txHash={resolvedParams.txHash} />
}
