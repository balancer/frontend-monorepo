'use client'

import { RemoveLiquidityPage } from '@repo/lib/shared/pages/RemoveLiquidityPage'

type Props = {
  params: { txHash?: string[] }
}

export default function RemoveLiquidityPageWrapper({ params: { txHash } }: Props) {
  return <RemoveLiquidityPage txHash={txHash} />
}
